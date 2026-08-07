
# BIBLE DU PROJET — SAHAM BANK ANALYTICS PORTAL

> Cette bible a été écrite pour être lue par un débutant en data engineering et en
> développement web. Aucun morceau de code n'est montré sans être expliqué : chaque
> bloc est traduit en français clair, ligne par ligne ou étape par étape.

---

## TABLE DES MATIÈRES

- 1. Cadrage du projet
- 2. Architecture d'ensemble : les briques
- 3. La source : simulateur de données + anomalies
- 4. Couche BRONZE : la matière brute
- 5. Couche SILVER : la validation et le nettoyage
- 6. Couche GOLD : le schéma en étoile (star schema)
- 7. L'orchestrateur run_pipeline.py
- 8. Full load vs Incremental
- 9. Le backend FastAPI : l'API
- 10. La sécurité et l'authentification
- 11. Le frontend : le portail web
- 12. Le module RAG / Chatbot IA (en cours)
- 13. État d'avancement (fait / en attente)
- 14. Plan de déploiement en ligne (URL)
- 15. Glossaire pédagogique
- 16. Les commandes indispensables

---

## 1. Cadrage du projet

**En une phrase :** c'est un portail web d'analytique bancaire (Saham Bank) qui
transforme des données financières brutes en **tableaux de bord** (KPI, graphiques)
et bientôt en **chatbot IA** capable de répondre à des questions sur les données.

L'architecture suit un modèle classique de **data warehouse** en 3 couches :

```
   Données brutes          Données nettoyées        Données prêtes
   (source initiale)  ---> (validées + tracées)  ---> (analyse / graphiques)
   [BRONZE]                [SILVER]                   [GOLD]
```

**Question type de soutenance :** "Pourquoi passer par 3 couches au lieu d'une seule
table ?"

Réponse : chaque couche a un **rôle précis**. Le BRONZE garde tel quel ce qui vient
de la source. Le SILVER **valide** et garde la trace des erreurs. Le GOLD est
**structuré pour l'analyse** (schéma en étoile). Séparer ça rend le projet robuste,
auditable et compréhensible.

---

## 2. Vue d'ensemble de l'architecture

### 2.1 Les briques du projet

| Brique | Technologie | Rôle |
|---|---|---|
| Données source | CSV générés + **Faker** + 10 % d'anomalies | simuler une vraie base bancaire marocaine |
| ETL | Python + **SQLAlchemy** | extraire (CSV → bronze), transformer (→ silver), charger (→ gold) |
| Base de données | **PostgreSQL** | stocker les 3 couches + les tables opérationnelles |
| API | **FastAPI** | exposer les données du gold en JSON, gérer l'authentification |
| Frontend | **HTML/JS + Chart.js** (fichier unique) | tableaux de bord + chatbot IA |
| IA (RAG) | Groq/Ollama + **pgvector** (en cours) | répondre en langage naturel sur les données et les documents |

### 2.2 Le flux global de bout en bout

```
generate_data.py          (Faker + anomalies) --> 5 fichiers CSV
        |
        v
extract_bronze.py --lit les CSV--> bronze_* (brut en base)
        |
        v
transform_silver.py --valide/nettie/dedup--> silver_* (is_valid, error_message)
        |
        v
transform_gold.py --star schema--> gold (dim_* + fact_*)
        |
        v
routers/gold.py --API JSON--> index.html (KPI + graphiques)
```

> L'API ne parle jamais a ta machine : elle lit la base PostgreSQL et renvoie du JSON
> au navigateur via des requetes HTTP.

### 2.3 Pourquoi ce choix d'architecture (question d'entretien frequente)

- **Bronze/Silver/Gold** : separation des concernes, tracabilite, robustesse.
- **Star schema en gold** : rapide a interroger (JOIN simples) -> les dashboards
  repondent vite.
- **API REST** : decouple le frontend de la base ; on peut basculer sur une base
  cloud sans toucher au navigateur.

---

---

## 3. La source : simulateur de données + anomalies

Fichier : `backend/etl/generate_data.py`

### 3.1 Pourquoi simuler des données ?

On n'a pas de vraies données bancaires (secret bancaire + impossible a obtenir pour
un stage). A la place, on **fabrique** des donnees realistes avec la bibliotheque
**Faker** (qui genere des noms, telephones, adresses...) et on y injecte volontairement
des **anomalies** (~10 % des lignes) pour que le travail d'un **data engineer**
(nettoyage dans la couche Silver) ait un sens.

> A retenir pour la soutenance : ne jamais dire "ce sont de vraies donnees". Dire :
> "des donnees simulees de facon realiste, servies par un vrai pipeline ETL."

### 3.2 Les parametres de simulation

```python
fake = Faker("fr_FR")          # generateur de noms/telephones en francais
ANOMALY_RATE = 0.10            # 10% des lignes auront au moins un defaut
```

Explication : `Faker("fr_FR")` prepare un objet capable de generer des valeurs
"francaises" (prenoms, villes, telephones marocains). `ANOMALY_RATE` est la
probabilite qu'une ligne soit corrompue : c'est le parametre qui controle la quantite
de salete des donnees.

### 3.3 Les distributions (les regles du jeu)

```python
SEGMENTS = ["Particuliers", "PME", "Professionnels", "Grandes Entreprises", "Bancassurance"]
SEGMENT_WEIGHTS = [0.55, 0.25, 0.10, 0.06, 0.04]
```

Explication : les clients sont repartis en **5 segments**. Les **poids** indiquent
la probabilite de tomber sur chaque segment : 55 % de Particuliers, 25 % de PME,
etc. C'est pour que la simulation ressemble a une vraie banque (beaucoup de
particuliers, peu de grandes entreprises).

```python
SCORE_MEAN = {"Particuliers": 62, "PME": 52, "Professionnels": 68, ...}
ENCOURS_MIN = {"Particuliers": 10000, "PME": 200000, ...}
ENCOURS_MAX = {"Particuliers": 800000, "PME": 8000000, ...}
```

Explication : chaque segment a son **profil financier** :
- `SCORE_MEAN` : le **score moyen** du segment (note de 0 a 100, style credit bureau).
- `ENCOURS_MIN` / `ENCOURS_MAX` : l'encours (montant du credit en cours) **minimum et
  maximum** du segment. Une PME emprunte des centaines de milliers, une grande
  entreprise des dizaines de millions.

```python
CREDIT_TYPES = ["Mourabaha Immo", "Ijara", "Mourabaha Auto", "Credit Tresorerie", "Investissement PME"]
CREDIT_WEIGHTS = [0.35, 0.20, 0.25, 0.12, 0.08]
```

Explication : les **types de financement islamique** proposes par Saham Bank
(Mourabaha = financement avec marge, Ijara = location-acquisition). Les poids
repartissent les engagements : 35 % Mourabaha Immo, etc.

```python
ENG_STATUS = ["En analyse", "Valide", "Debloque", "Surveillance", "Contentieux"]
ENG_STATUS_WEIGHTS = [0.10, 0.25, 0.50, 0.10, 0.05]
```

Explication : le cycle de vie d'un engagement (une demande de credit) : En analyse
(10 %), Valide (25 %), Debloque = fonds verses (50 %), Surveillance (10 %),
Contentieux = impaye (5 %). Les statuts Surveillance et Contentieux sont ceux qui
font monter le **taux de NPL** (creeances douteuses).

### 3.4 Les listes de valeurs marocaines

```python
VILLES = [
    ("Casablanca", "Casablanca-Settat"),
    ("Rabat", "Rabat-Sale-Kenitra"),
    ...
]
```

Explication : chaque ville est associee a sa **region administrative** marocaine.
Cela permet de generer des agences coherentes (ville + region correctes).

```python
PRENOMS_M = ["Mohamed", "Ahmed", "Hassan", ...]
PRENOMS_F = ["Fatima", "Khadija", "Amina", ...]
NOMS = ["Bennani", "Alaoui", "Idrissi", ...]
```

Explication : des listes de **prenoms et noms marocains** pour rendre les clients
credibles. Le generateur en prend un au hasard.

### 3.5 Les petites fonctions utiles

```python
def random_name():
    p = random.choice(PRENOMS_M + PRENOMS_F)   # un prenom au hasard (homme ou femme)
    n = random.choice(NOMS)                    # un nom de famille au hasard
    return f"{p} {n}"                          # ex: "Khadija Bennani"
```

```python
def random_phone():
    return f"0{random.choice(PHONE_PREFIXES)}{random.randint(10,99)}{random.randint(10,99)}{random.randint(10,99)}"
```

Explication : fabrique un numero marocain type : commence par 0 + un prefixe 061/062/...
+ 6 chiffres. Ex : `0651223344`.

### 3.6 L'injection d'anomalies (LE concept cle)

```python
def inject_anomaly(row, fields, anomaly_type=None):
    if anomaly_type is None:
        anomaly_type = random.choice(["null", "vide", "format", "outlier", "incoherent"])
    field = random.choice(fields)
    if anomaly_type == "null":
        row[field] = None                      # champ carrement absent
    elif anomaly_type == "vide":
        row[field] = ""                        # champ vide (chaine vide)
    elif anomaly_type == "format":
        if field in ["telephone", "phone", "tel"]:
            row["telephone"] = "0000000000"    # numero bidon
        elif field == "email":
            row["email"] = "pas_un_email"      # email sans @ ni .
        elif field == "score":
            row["score"] = -5                  # score negatif impossible
    elif anomaly_type == "outlier":
        if field == "encours":
            row["encours"] = 999999999         # encours aberrant (999 millions)
        elif field == "score":
            row["score"] = 999                 # score > 100
        elif field == "montant":
            row["montant"] = 0                 # montant nul
    elif anomaly_type == "incoherent":
        if field == "statut":
            row["statut"] = "Inconnu"          # statut qui n'existe pas
        elif field == "segment":
            row["segment"] = "VIP"             # segment inexistant
    return row
```

**Explication pedagogique :** cette fonction endommage UN champ de la ligne selon un
des 5 types de defaut, choisis au hasard :

| Type | Ce que ca simule | Exemple |
|---|---|---|
| `null` | donnee manquante | `score = None` |
| `vide` | champ laisse vide | `email = ""` |
| `format` | valeur au mauvais format | telephone `0000000000`, email `pas_un_email` |
| `outlier` | valeur aberrante | encours de 999 millions, score de 999 |
| `incoherent` | valeur hors catalogue | segment `VIP`, statut `Inconnu` |

C'est exactement ce qu'un data engineer voit dans la realite : des emails mal
ecrits, des montants impossibles, des valeurs manquantes. La couche Silver devra
**detecter** ces defauts (et en garder trace), voire **corriger** ceux qui sont
corrigeables.

### 3.7 Generation des agences

```python
def generate_agences(count=10):
    rows = []
    for i in range(min(count, len(VILLES))):
        ville, region = VILLES[i]
        r = {
            "id": f"AG-{i+1:03d}",                       # AG-001, AG-002...
            "nom": f"Agence {ville} {'Centre' if i%2==0 else 'Principale'}",
            "ville": ville,
            "region": region,
            "directeur": random_name(),
            "telephone": random_phone(),
            "email": f"ag{ville.lower()[:3]}@sahambank.ma",   # agcas@sahambank.ma
        }
        if random.random() < 0.05:                       # 5% d'anomalies
            r = inject_anomaly(r, ["telephone", "email"])
        rows.append(r)
    return rows
```

Explication : cree 10 agences, une par ville. `random.random() < 0.05` = il y a 5 %
de chance que l'agence ait une anomalie sur son telephone ou son email.

### 3.8 Generation des clients (le plus riche)

```python
def generate_clients(count=500, agences=None):
    ...
    for i in range(count):
        segment = random.choices(SEGMENTS, weights=SEGMENT_WEIGHTS, k=1)[0]
        score = max(0, min(100, int(random.gauss(SCORE_MEAN[segment], 18))))
        encours = round(random.uniform(ENCOURS_MIN[segment], ENCOURS_MAX[segment]), 2)

        if score >= 60:
            status = "Actif"
        elif score >= 35:
            status = "A risque"
        else:
            status = "Defaut"
```

Explication point par point :
- `random.choices(SEGMENTS, weights=...)` : tire un segment **selon les poids** (55 %
  de particuliers, etc.).
- `random.gauss(moyenne, 18)` : tire un score autour de la moyenne du segment, avec
  un ecart type de 18 (loi normale = repartition en cloche, comme en vrai).
- `max(0, min(100, ...))` : bloque le score entre 0 et 100 (il ne peut pas depasser).
- **Statut coherent avec le score** : score >= 60 -> Actif ; entre 35 et 60 -> a
  risque ; en dessous -> en defaut. C'est une regle metier : un bon score = client
  sain. SAUF si une anomalie vient corrompre le statut.

### 3.9 Generation des engagements

```python
season_mult = {1: 0.7, 2: 0.75, 3: 0.85, ..., 10: 1.2, 11: 1.3, 12: 1.4}
```

Explication : la **saisonnalite**. En fin d'annee (octobre-decembre) la banque fait
plus de credits (fin d'exercice, fete), en debut d'annee moins. Le montant d'un
engagement est multiplie par ce coefficient selon le mois de depot.

```python
    if credit_type == "Mourabaha Immo":
        montant_base = random.gauss(600000, 200000)   # un bien immobilier coute cher
    elif credit_type == "Ijara":
        montant_base = random.gauss(400000, 150000)
    elif credit_type == "Mourabaha Auto":
        montant_base = random.gauss(250000, 80000)    # une voiture, plus petit
```

Explication : le montant d'un credit **depend de son type**. C'est coherent avec la
realite : un financement immobilier est plus gros qu'un financement auto.

```python
    if credit_type in ["Mourabaha Immo", "Ijara"]:
        duree = random.choice([120, 180, 240])        # 10, 15 ou 20 ans
    elif credit_type == "Mourabaha Auto":
        duree = random.choice([24, 36, 48, 60])       # 2 a 5 ans
```

Explication : la **duree du remboursement** depend aussi du type de credit.
Immobilier = longue (10-20 ans), auto = courte (2-5 ans).

```python
    year = random.choice([2023, 2024, 2025, 2026])    # etalement sur 4 ans
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    montant = round(max(20000, montant_base * season), 2)  # jamais moins de 20 000
    date_depot = datetime(year, month, day, ...).strftime("%Y-%m-%d %H:%M:%S")
```

Explication : les engagements sont repartis sur **4 annees** (2023-2026) pour que les
graphiques par mois aient du sens. `max(20000, ...)` garantit un montant minimal.

### 3.10 Generation des utilisateurs et de la qualite CRM

```python
def generate_users(count=8):
    roles = ["DG", "DR", "CA", "AR", "ADMIN"]
```

Explication : 8 comptes avec des **roles hierarchiques** : DG (Direction Generale),
DR (Direction Regionale), CA (Charge d'Affaires), AR (Agent de Reseau), ADMIN.
Ces roles servent au controle d'acces du portail.

```python
def generate_qualite(agences=None):
    for aid in agence_ids:
        for year in [2023, 2024, 2025, 2026]:
            for month in range(1, 13):
                note_satisfaction = random.randint(30, 85)
                recl_ouvertes = random.randint(0, 20)
                recl_traitees = max(0, recl_ouvertes - random.randint(0, 5))
```

Explication : pour **chaque agence**, on cree une mesure de qualite pour **chaque
mois des 4 annees** (10 agences x 48 mois = 480 lignes). Chaque mesure contient la
note de satisfaction client, les reclamations ouvertes et celles traitees
(`max(0, ...)` evite un nombre negatif de reclamations traitees).

### 3.11 L'ecriture des CSV

```python
def save_csv(filename, rows):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()          # ecrit la ligne d'en-tete (les colonnes)
        writer.writerows(rows)        # ecrit toutes les lignes
```

Explication : `csv.DictWriter` ecrit les dictionnaires en CSV. `rows[0].keys()`
prend les colonnes de la premiere ligne comme en-tete. Les fichiers partent dans
`etl/data/` (agences.csv, clients.csv, engagements.csv, users.csv, crm.csv).

```python
def main():
    agences = generate_agences(10);    save_csv("agences.csv", agences)
    clients = generate_clients(500, agences); save_csv("clients.csv", clients)
    engagements = generate_engagements(2000, clients); save_csv("engagements.csv", engagements)
    users = generate_users(8);         save_csv("users.csv", users)
    qualite = generate_qualite(agences); save_csv("crm.csv", qualite)
```

Explication : l'ordre est important : les clients ont besoin des agences (pour
l'agence_id), les engagements ont besoin des clients (client_id), etc.

### 3.12 Conclusion chapitre 3

A la fin de cette etape on a 5 CSV realistes avec ~10 % de lignes defectueuses.
C'est la **matiere premiere** du pipeline. Le travail de nettoyage commence dans le
BRONZE (chargement brut) puis surtout dans le SILVER (validation).

---

---

## 4. Couche BRONZE : la matière brute

Fichiers : `backend/etl/bronze/extract_bronze.py` et `bronze/load_bronze.py`

### 4.1 Le principe

Le BRONZE est le **miroir brut** de la source : on copie les CSV en base **sans rien
corriger**. S'il y a un email bidon ou un montant de 999 millions, il est stocké tel
quel (ou rejeté si la base l'interdit — on le verra). Un data engineer peut ainsi
voir exactement ce qui est arrivé.

### 4.2 L'extraction (lire les CSV)

Fichier : `extract_bronze.py`

```python
class BronzeExtractor:
    @staticmethod
    def _read_csv(filename: str) -> List[Dict[str, Any]]:
        path = os.path.join(CSV_DIR, filename)
        if not os.path.exists(path):
            print(f"  [!] Fichier introuvable : {path}")
            return []
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            return [dict(row) for row in reader]
```

Explication :
- `csv.DictReader(f)` transforme chaque ligne du CSV en **dictionnaire** dont les
  clés sont les colonnes du fichier. Ex : `{"id": "CLI-10001", "score": "-5", ...}`.
- `[dict(row) for row in reader]` : on convertit chaque ligne en dict et on met le
  tout dans une liste.
- Attention : **tout est lu comme texte**. `"score": "-5"` est une chaîne, pas un
  entier. C'est la base qui fera le casting (conversion) — et c'est là que les
  anomalies vont sauter.

```python
    def extract_all(self) -> Dict[str, List[Dict[str, Any]]]:
        return {
            "users": self.extract_users(),
            "agences": self.extract_agences(),
            "clients": self.extract_clients(),
            "engagements": self.extract_engagements(),
            "qualite": self.extract_qualite(),
        }
```

Explication : `extract_all` lit les 5 fichiers d'un coup et rend un **dictionnaire**
qui groupe les lignes par table. C'est la forme qu'attendent les chargeurs.

### 4.3 La création des tables (le DDL)

Fichier : `load_bronze.py`

```python
    def create_tables(self):
        with self.engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS bronze_clients (
                    id VARCHAR(50) PRIMARY KEY,
                    nom VARCHAR(100) NOT NULL,
                    segment VARCHAR(50) NOT NULL,
                    agence_id VARCHAR(50) NOT NULL,
                    encours DECIMAL(15,2) DEFAULT 0,
                    score INTEGER NOT NULL,
                    statut VARCHAR(50) NOT NULL,
                    email VARCHAR(100),
                    telephone VARCHAR(20)
                )
            """))
            conn.commit()
```

Explication du DDL (langage de définition de données) :
- `CREATE TABLE IF NOT EXISTS` : crée la table si elle n'existe pas encore.
- `VARCHAR(50)` : texte de max 50 caractères. `DECIMAL(15,2)` : nombre avec 2
  décimales. `INTEGER` : nombre entier.
- `PRIMARY KEY` : la colonne qui identifie chaque ligne de façon unique (l'id).
- `NOT NULL` : **la colonne ne peut pas être vide**. C'est LE point clé du bronze :
  une anomalie qui met `score = NULL` (ligne "null") sera **rejetée par la base**
  car `score INTEGER NOT NULL`.
- `DEFAULT 0` : si rien n'est fourni, mettre 0.

> **Pourquoi le bronze rejette des lignes ?** C'est voulu. Le bronze applique les
> règles "dures" de la source (les champs obligatoires). Une ligne avec un score
> vide ou un montant null viole ces règles et est ignorée (avec un message d'alerte).
> C'est pour ça que `bronze_clients` peut avoir 499 lignes quand le CSV en a 500 :
> 3 lignes corrompues ont été refusées à l'insertion.

### 4.4 Le chargement avec SAVEPOINT (l'astuce SQL)

```python
    def load_clients(self, clients: List[Dict[str, Any]]) -> int:
        session = self.SessionLocal()
        count = 0
        for c in clients:
            cleaned = self._clean_row(c, ["score", "encours"])
            try:
                with session.begin_nested():        # OUVRE UN SAVEPOINT
                    session.execute(
                        text("""
                            INSERT INTO bronze_clients (id, nom, segment, ...)
                            VALUES (:id, :nom, :segment, ...)
                        """),
                        cleaned
                    )
                count += 1
            except Exception as e_row:
                print(f"  [WARN] Ligne ignoree (client {c.get('id','?')}) : {e_row}")
        try:
            session.commit()
            return count
```

Explication (concept important) :
- `INSERT INTO ... VALUES (:id, :nom, ...)` : requête **paramétrée**. Les `:id`,
  `:nom` sont des emplacements remplis par le dictionnaire `cleaned`. Utiliser des
  paramètres (au lieu de coller les valeurs dans la chaîne) protège des **injections
  SQL** et gère les types.
- `with session.begin_nested()` : crée un **SAVEPOINT** (un point de restauration).
  Si l'INSERT échoue (par ex. `score NOT NULL` violé), on revient à ce point et on
  **passe à la ligne suivante** sans casser tout le lot. C'est comme un "try/catch"
  SQL : une ligne qui échoue est sautée, les autres sont insérées.
- `count += 1` : on ne compte que les lignes insérées avec succès.

> Ce mécanisme est central pour la soutenance : "Comment gères-tu une ligne
> invalide sans faire planter tout le chargement ?" → "Grâce aux SAVEPOINTs :
> chaque ligne est insérée dans sa propre transaction imbriquée ; si elle échoue,
> elle est ignorée et le lot continue."

### 4.5 Le nettoyage minimal (cleaned)

```python
    @staticmethod
    def _clean_row(row, numeric_fields):
        cleaned = dict(row)
        for field in numeric_fields:
            if field in cleaned and (cleaned[field] is None or str(cleaned[field]).strip() == ""):
                cleaned[field] = None      # transforme "" en NULL
        return cleaned
```

Explication : les CSV sont lus en texte. Une cellule vide devient `""`. Or la base
attend `NULL` pour un champ vide. Cette fonction convertit les **chaînes vides en
NULL** sur les champs numériques (score, encours, montant...). C'est le seul
"nettoyage" fait au bronze — le vrai travail est au silver.

### 4.6 Le vidage (truncate) : propre idempotence

```python
    def truncate_all(self):
        with self.engine.connect() as conn:
            for table in ["bronze_engagements", "bronze_clients", "bronze_agences", ...]:
                conn.execute(text(f"TRUNCATE TABLE {table} CASCADE"))
            conn.commit()
        print("  [OK] Tables bronze videes")
```

Explication : `TRUNCATE` supprime **tout** le contenu de la table (plus vite que
DELETE). On vide avant de recharger pour que chaque run reparte d'une base propre :
c'est ce qui rend le pipeline **idempotent** (le relancer donne toujours le même
résultat, pas de doublons). `CASCADE` supprime aussi les données liées par clés
étrangères.

### 4.7 Les compteurs de sortie

```python
    def load_all(self, data):
        return {
            "agences": self.load_agences(data.get("agences", [])),
            "clients": self.load_clients(data.get("clients", [])),
            ...
        }
```

Explication : `load_all` charge les 5 tables et renvoie un dictionnaire
`{nom_table: nb_lignes_inserees}`. L'orchestrateur s'en sert pour afficher un
bilan à la fin.

### 4.8 Conclusion chapitre 4

Le bronze = copie brute + règles "dures" (NOT NULL) + SAVEPOINT pour sauter les
lignes refusées. Résultat typique après un run :

```
bronze_clients: 499 lignes        (1 rejet : score NULL)
bronze_engagements: 1962 lignes   (38 rejets : montant NULL, duree 0...)
bronze_qualite: 455 lignes        (25 rejets : date invalide)
```

**Mais attention** : le bronze jette l'information des erreurs ! Une ligne rejetée
disparaît sans trace. C'est justement pour ça que la couche SILVER existe : elle
stocke TOUTES les lignes, même invalides, avec le détail de l'erreur.

---

---

## 5. Couche SILVER : la validation et le nettoyage

Fichiers : `backend/etl/silver/transform_silver.py` et `silver/load_silver.py`

### 5.1 Le rôle (et la différence avec le bronze)

Le bronze **rejette** les lignes qui violent ses règles "dures" (NOT NULL), sans
trace. Le SILVER fait mieux : il **stocke toutes les lignes**, valides ou non, avec
une colonne `is_valid` (booléen) et `error_message` (pourquoi). On ne perd jamais
l'information.

```
silver_clients:
   id          |  segment  |  score | is_valid | error_message
   CLI-10001   |  PME      |  62    |  TRUE    |  NULL
   CLI-10002   |  VIP      |  -5    |  FALSE   | "Segment inconnu: VIP; Score negatif: -5"
```

> Le SILVER est donc plus large que le bronze : il contient 500 clients quand le
> bronze en a 499, parce qu'il a stocké 1 ligne invalide de plus (au lieu de les
> jeter). Ce n'est pas une erreur, c'est **par conception**. On retrouvera la
> question bronze vs silver en soutenance.

### 5.2 Les listes de valeurs autorisées

```python
VALID_SEGMENTS   = {"Particuliers", "Professionnels", "PME", "Grandes Entreprises", "Bancassurance"}
VALID_STATUTS_CLIENT = {"Actif", "Defaut", "A risque"}
VALID_STATUTS_ENGAGEMENT = {"Valide", "Debloque", "Surveillance", "Contentieux", "En analyse"}
VALID_TYPES_CREDIT = {"Mourabaha Immo", "Mourabaha Auto", "Ijara", "Credit Tresorerie", "Investissement PME"}
VALID_ROLES = {"DG", "DR", "CA", "ADMIN", "AR"}
```

Explication : des **ensembles** (set) contenant toutes les valeurs "officielles"
acceptées. C'est le **référentiel** du projet. Toute valeur qui n'est pas dans le
set est considérée comme invalide (ex : segment "VIP", statut "Inconnu").

### 5.3 Les convertisseurs de types (solides face au texte)

```python
def _to_float(val):
    if val is None: return None          # rien -> None
    s = str(val).strip()                 # en texte, sans espaces
    if s == "" or s == "None": return None   # vide ou "None" -> None
    try:
        return float(s)                  # ex: "1234.56" -> 1234.56
    except (ValueError, TypeError):
        return None                      # "abc" -> None (impossible a convertir)
```

Explication : les CSV arrivent comme texte. `_to_float` essaie sagement de convertir
en nombre ; si c'est impossible (ex. "abc"), il renvoie `None`. De même `_to_int`
pour les entiers. C'est la première barrière de validation : une valeur non
numérique devient None, donc "invalide".

```python
def _is_valid_email(val):
    if val is None: return False
    s = str(val).strip()
    return bool(re.match(r"[^@]+@[^@]+\.[^@]+", s))
```

Explication : une **regex** (expression régulière) qui vérifie la forme d'un email :
quelque chose + `@` + quelque chose + `.` + quelque chose. `"pas_un_email"` ne passe
pas (pas de @), `"client1@email.com"` passe. C'est un contrôle de FORMAT.

### 5.4 Les colonnes techniques de traçabilité

```python
def _add_tech_cols(self, row, is_valid, errors):
    row["is_valid"] = is_valid
    row["error_message"] = "; ".join(errors) if errors else None
    row["ingested_at"] = datetime.now()
    return row
```

Explication : à la fin de chaque validation, on ajoute 3 colonnes :
- `is_valid` : `True` si aucune erreur, sinon `False`.
- `error_message` : toutes les erreurs reliées par `; `. Si aucune, `None`.
- `ingested_at` : l'**horodatage** de l'ingestion (quand la ligne a été traitée).

C'est la **traçabilité** : l'analyste peut retrouver divis pourquoi une ligne est
invalide (= elle n'apparaîtra pas dans les tableaux gold).

### 5.5 Validation d'un client (l'exemple complet)

```python
def validate_client(self, client):
    errors = []
    client = dict(client)
    cid = client.get("id")
    if cid: self.client_ids.add(str(cid).strip())   # memorise l'id (pour dedup)

    if not client.get("nom") or str(client["nom"]).strip() == "":
        errors.append("Nom client vide")

    segment = str(client.get("segment", "")).strip()
    if segment == "":
        errors.append("Segment vide")
    elif segment not in VALID_SEGMENTS:
        errors.append(f"Segment inconnu: {segment}")
    client["segment"] = segment if segment in VALID_SEGMENTS else None

    score = _to_int(client.get("score"))
    if score is None:
        errors.append("Score vide"); client["score"] = None
    elif score < 0:
        errors.append(f"Score negatif: {score}"); client["score"] = 0
    elif score > 100:
        errors.append(f"Score > 100: {score}"); client["score"] = 100
    else:
        client["score"] = score
    ...
    return self._add_tech_cols(client, len(errors) == 0, errors)
```

Explication champ par champ :
- **nom** : vide -> erreur.
- **segment** : doit être dans `VALID_SEGMENTS`. Si c'est "VIP" -> erreur ET on
  remet `None` (`client["segment"] = ... else None`). Le champ est corrompu puisqu'il
  n'existe pas dans le référentiel.
- **score** : on convertit. `None` -> "Score vide". Négatif -> on corrige à 0 (mais
  on garde une erreur). > 100 -> on corrige à 100 (erreur aussi). Entre 0 et 100 -> ok.
- Ensuite viennent **encours** (borne 0..50 000 000), **email** (regex), **statut**
  (référentiel) et **agence_id** (non vide).

> Observation pédagogique : certaines anomalies sont **corrigées** (score négatif -> 0),
> d'autres seulement **signalées**. La distinction correspond à une règle métier.
> `is_valid` sera `False` dès qu'il y a au moins une erreur, même si on a corrigé.

### 5.6 Validation d'un engagement

```python
def validate_engagement(self, engagement):
    ...
    montant = _to_float(engagement.get("montant"))
    if montant is None: errors.append("Montant vide")
    elif montant < 0:   errors.append(f"Montant negatif: {montant}")
    engagement["montant"] = montant

    duree = _to_int(engagement.get("duree"))
    if duree is None: errors.append("Duree vide")
    elif duree <= 0: errors.append(f"Duree invalide: {duree}")
```

Explication : typique d'un engagement. Le montant doit être un nombre, non négatif.
La durée doit être un entier strictement positif (0 ou négatif = invalide). Le taux
de même (strictement positif). Le score est borné 0-100. Le statut dans le
référentiel. Le type de crédit dans `VALID_TYPES_CREDIT`.

### 5.7 La déduplication

```python
def deduplicate(self, data, key):
    seen = set()
    unique = []
    for item in data:
        k = item.get(key)
        if k not in seen:      # on ne garde que la première occurrence
            seen.add(k)
            unique.append(item)
    return unique
```

Explication : supprime les doublons. On garde en mémoire les clés déjà vues (`seen`).
Si une ligne a déjà une clé identique, on ne la garde pas. `key` indique quelle
colonne sert d'identifiant : `"id"` pour les clients, `"ref"` pour les engagements,
`"qualite_id"` pour la qualité.

### 5.8 L'orchestration de la transformation

```python
def transform_all(self, bronze_data):
    self.agence_ids = set()
    self.client_ids = set()        # reset des memoires de dédup
    agences  = [self.validate_agence(a)  for a in bronze_data.get("agences", [])]
    users    = [self.validate_user(u)    for u in bronze_data.get("users", [])]
    clients  = [self.validate_client(c)  for c in bronze_data.get("clients", [])]
    engagements = [self.validate_engagement(e) for e in bronze_data.get("engagements", [])]
    qualite  = [self.validate_qualite(q)  for q in bronze_data.get("qualite", [])]
    return {
        "users": self.deduplicate(users, "id"),
        "agences": self.deduplicate(agences, "id"),
        "clients": self.deduplicate(clients, "id"),
        "engagements": self.deduplicate(engagements, "ref"),
        "qualite": self.deduplicate(qualite, "qualite_id"),
    }
```

Explication : on applique la validation à chaque ligne de chaque groupe, puis on
dé-duplique. Le résultat est un dictionnaire : chaque table silver = liste de lignes
enrichies de `is_valid`, `error_message`, `ingested_at`.

### 5.9 Le chargement silver (bulk)

Fichier : `load_silver.py`

```python
def _bulk_insert(self, table, rows, columns):
    if not rows: return 0
    session = self.SessionLocal()
    count = 0
    for row in rows:
        cleaned = {k: row.get(k) for k in columns}   # on ne garde que les colonnes voulues
        try:
            with session.begin_nested():             # SAVEPOINT
                placeholders = ", ".join([f":{c}" for c in columns])
                session.execute(text(f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders})"), cleaned)
            count += 1
        except Exception as e_row:
            print(f"[WARN] Ligne ignoree ({table} ...) : {e_row}")
    try:
        session.commit()
    except Exception as e:
        session.rollback(); print(f"  [ERR] {table} commit : {e}"); return 0
    return count
```

Explication : `columns` est une liste comme
`["id", "nom", "segment", ..., "is_valid", "error_message", "ingested_at"]`.
- `cleaned` ne garde que ces colonnes (ordre propre).
- On construit une requête INSERT avec `:` + nom pour chaque colonne (paramétré).
- `session.begin_nested()` = SAVEPOINT : si l'insert échoue (ex : doublon de clé
  primaire), on saute la ligne sans casser le lot.

Note : l'ordre des colonnes dans la liste EST la liste des colonnes insérées. C'est
pour ça qu'on construit à la main `placeholders` et `col_names` (éviter les
décimales coupées et les injections).

### 5.10 Robusts vs. le bronze (à retenir)

| | BRONZE | SILVER |
|---|---|---|
| Règles appliquées | NOT NULL "dures" | validation métier complète |
| Lignes invalides | **rejetées** (disparaissent) | **stockées** avec is_valid=False + error |
| Comptage | clients: 499 | clients: 500 (dont 1 invalide) |
| Trace des erreurs | aucune | oui (error_message) |
| Horizon | miroir de la source | base propre + traçabilité |

---

---

## 6. Couche GOLD : le schéma en étoile (star schema)

Fichiers : `backend/etl/gold/transform_gold.py` et `gold/load_gold.py`

### 6.1 Pourquoi un "schéma en étoile" ?

Le gold est structuré pour **répondre vite aux questions d'analyse**. On sépare les
**dimensions** (comment on décrit : client, agence, date, type de crédit) et les
**faits** (ce qu'on mesure : engagements, performances, risque, qualité).

```
               [dim_client] ---+
                               |
[dim_agence] ---- fact_engagement --+--- [dim_type_credit]
                               |
               [dim_date] -----+
```

- Les **dimensions** portent les libellés (nom du client, ville de l'agence...).
- Les **faits** portent les mesures (montant, score, PNB, ratio NPL...).
- On joint par des **clés** (client_id, agence_id, date_id, type_credit_id).

> Avantage pour la soutenance : une requête de dashboard fait des JOIN simples et
> des agrégations (SUM, AVG, GROUP BY) très rapides. C'est le standard des data
> warehouses OLAP.

### 6.2 Les tables du gold (le DDL)

Fichier : `load_gold.py`. Le `create_tables` **DROP d'abord toutes les tables** puis
les recrée (c'est un "reset complet" du gold à chaque run) :

```sql
DROP TABLE IF EXISTS fact_risque CASCADE;
DROP TABLE IF EXISTS fact_qualite CASCADE;
DROP TABLE IF EXISTS fact_performance CASCADE;
DROP TABLE IF EXISTS fact_engagement CASCADE;
DROP TABLE IF EXISTS dim_utilisateur CASCADE;
...
```

Puis les créations, par exemple :

```sql
CREATE TABLE IF NOT EXISTS dim_client (
    client_id VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(100),
    segment VARCHAR(50),
    email VARCHAR(100),
    telephone VARCHAR(20),
    agence_id VARCHAR(50),
    ville VARCHAR(50),
    encours_actuel DECIMAL(15,2),
    score_actuel INTEGER,
    statut_actuel VARCHAR(50)
)
```

Explication : `dim_client` porte l'**état actuel** du client (encours, score,
statut) + ses attributs descriptifs (nom, segment, ville, contact). C'est une
dimension de type SCD1 : on garde l'état courant, pas l'historique des changements.

Les 5 dimensions : `dim_date`, `dim_client`, `dim_agence`, `dim_type_credit`,
`dim_utilisateur`. Les 4 faits : `fact_engagement`, `fact_performance`,
`fact_risque`, `fact_qualite`.

### 6.3 dim_date : le calendrier (brique en jours)

```python
def build_dim_date(self):
    rows = []
    start = date(2023, 1, 1)
    end = date(2026, 12, 31)
    d = start
    while d <= end:                       # boucle du 01/01/2023 au 31/12/2026
        rows.append({
            "date_id": int(d.strftime("%Y%m%d")),   # 20230101, 20260715...
            "annee": d.year,                        # 2026
            "mois": d.month,                        # 7
            "mois_libelle": d.strftime("%B"),       # "juillet" (en francais)
            "trimestre": (d.month - 1) // 3 + 1,    # 1, 2, 3 ou 4
            "semestre": 1 if d.month <= 6 else 2,   # 1 ou 2
            "annee_mois": f"{d.year}-{d.month:02d}",# "2026-07"
        })
        d += timedelta(days=1)                     # +1 jour
    return rows
```

Explication : on génère **une ligne par jour** de 2023 à 2026 (soit ~1461 lignes).
`date_id` est un entier lisible (20260101). `annee_mois` ("2026-07") sert de clé de
filtrage dans le frontend (le sélecteur d'année). Les colonnes `annee`, `trimestre`,
`semestre`, `mois_libelle` permettent de grouper à plusieurs niveaux dans les
graphiques.

### 6.4 dim_client : jointure de la vraie ville (corrigé par T3)

```python
def build_dim_client(self):
    silver = self._fetch_silver("silver_clients")
    agences = self._fetch_silver("silver_agences")
    agence_ville = {a["id"]: a.get("ville", "") for a in agences}   # agence -> ville
    rows = []
    for s in silver:
        if not s.get("is_valid", True):
            continue                        # on saute les clients invalides
        aid = s.get("agence_id")
        rows.append({
            "client_id": s["id"],
            "nom": s.get("nom", ""),
            "segment": s.get("segment"),
            "ville": agence_ville.get(aid, ""),   # vraie ville via mapping T3
            ...
        })
    return rows
```

Explication :
- `if not s.get("is_valid")` : **on ne garde que les lignes valides** du silver.
  C'est la règle "gold = silver valide seulement".
- Depuis **T3 (corrigé)** : on joint la **vraie ville** de l'agence via un mapping
  `agence_id → ville` construit depuis `silver_agences`. Avant, le code fabriquait
  "Ville-001" à partir de l'id d'agence (`replace("AG-", "")` + `f"Ville-{ville}"`).

### 6.5 dim_agence et dim_type_credit

```python
def build_dim_agence(self):
    silver = self._fetch_silver("silver_agences")
    rows = []
    for s in silver:
        rows.append({ "agence_id": s["id"], "nom": s.get("nom", ""),
            "ville": s.get("ville", ""), "region": s.get("region", ""), ... })
    return rows
```

Explication : copie simple des agences valides du silver. `dim_type_credit` est
même codé en dur (5 types officiels) :

```python
CREDIT_TYPES = [
    {"type_credit_id": "CT-001", "libelle": "Mourabaha Immo", "famille": "Mourabaha"},
    {"type_credit_id": "CT-002", "libelle": "Mourabaha Auto", "famille": "Mourabaha"},
    ...
]
```

### 6.6 fact_engagement : le fait des dossiers de crédit

```python
def build_fact_engagement(self, dim_clients, dim_type_credits):
    silver = self._fetch_silver("silver_engagements")
    tc_map = {tc["libelle"]: tc["type_credit_id"] for tc in dim_type_credits}
    client_set = {c["client_id"] for c in dim_clients}   # clients VALIDES connus
    rows = []
    for s in silver:
        if not s.get("is_valid", True):
            continue
        cid = s.get("client_id", "")
        if cid not in client_set:
            continue                          # on saute si le client n'existe pas
        tc = s.get("type_credit", "")
        tc_id = tc_map.get(tc, "CT-000")      # si type inconnu -> CT-000
        ...
        rows.append({
            "engagement_id": s["ref"],
            "client_id": cid,
            "type_credit_id": tc_id,
            "agence_id": s.get("agence_id", ""),
            "montant": s.get("montant") or 0,
            "duree_mois": s.get("duree") or 0,
            "taux": s.get("taux") or 0,
            "score": s.get("score") or 50,
            "statut": s.get("statut", ""),
            "annee_mois_depot": annee_mois,   # "2026-03" extrait de la date
        })
    return rows
```

Explication :
- `tc_map` : dictionnaire "libellé -> id" pour résoudre le type de crédit en clé.
- `client_set` : ensemble des client_id **valides** → un engagement dont le client
  est invalide/absent est sauté (intégrité référentielle).
- `annee_mois` : extraite de `date_depot` (on prend l'année et le mois). Utile pour
  grouper les engagements par mois.
- `or 0` / `or 50` : valeurs de secours pour ne jamais stocker NULL.

### 6.7 fact_performance : PNB, NPL, NIM (le plus riche)

```python
SEASONAL_PNB = {1: 0.85, 2: 0.78, ..., 11: 1.25, 12: 1.35}   # saisonnalite

def build_fact_performance(self, dim_agences, dim_dates):
    engagements = self._fetch_silver("silver_engagements")
    clients = self._fetch_silver("silver_clients")
    months = sorted(set(d["annee_mois"] for d in dim_dates))   # 48 mois 2023-2026
    eng_by_month_agence = {}
    for e in engagements:
        if not e.get("is_valid", True): continue
        am = self._get_annee_mois(e.get("date_depot"))
        aid = e.get("agence_id", "")
        eng_by_month_agence.setdefault((am, aid), []).append(e)   # indexe
```

Explication : on **indexe les engagements par (mois, agence)** dans un dictionnaire
pour un accès rapide : à la clé `("2026-03", "AG-001")` on retrouve la liste des
engagements de cette agence ce mois-là. C'est de l'optimisation (évite de re-scanner
toute la liste à chaque agence/mois).

```python
    for am in months:
        for aid in agence_ids:
            ag_eng = eng_by_month_agence.get((am, aid), [])
            total_credits = sum(float(e.get("montant") or 0) for e in ag_eng)
            npl_eng = [e for e in ag_eng if e.get("statut") in ("Surveillance", "Contentieux")]
            npl_total = sum(float(e.get("montant") or 0) for e in npl_eng)
            npl_ratio = round((npl_total / total_credits * 100) if total_credits > 0 else 0, 2)
```

Explication : pour chaque (agence, mois) on calcule :
- `total_credits` : somme des montants des engagements ce mois-là.
- **NPL** (Non Performing Loans) : engagements **Surveillance ou Contentieux**.
  `npl_ratio` = montant NPL / total x 100. C'est le % de créances douteuses.
  Si aucun crédit (total = 0), ratio = 0 (éviter la division par zéro).

```python
            base_pnb = total_credits * 0.035 * season       # marge 3,5% x saison
            noise = base_pnb * random.uniform(-0.05, 0.05)  # bruit +/- 5%
            pnb = round(base_pnb + noise, 2)
```

Explication : le **PNB** (Produit Net Bancaire) est estimé comme 3,5 % de marge sur
les crédits, pondéré par la saison, plus un léger bruit aléatoire.
> STATUT : le bruit est piloté par `random.seed(42)` (chantier T1 terminé) → le gold
> est maintenant **déterministe** : deux runs donnent exactement les mêmes chiffres.

```python
            rows.append({
                "performance_id": f"PERF-{aid}-{am}",
                "pnb": pnb,
                "encours_depots": round(total_credits * (1.15 + random.uniform(-0.05, 0.1)), 2),
                "nim": round(total_credits * 0.045 * season if total_credits > 0 else 0, 2),
                "ratio_credits_depots": round(random.uniform(75, 95) if total_credits > 0 else 0, 2),
                "ratio_realisation": round(75 + random.uniform(-5, 20), 2) if ag_cli else 0,
            })
```

Explication : on remplit aussi `encours_depots` (dépôts ~ dérivés des crédits),
`nim` (marge nette d'intérêt = 4,5 % des crédits x saison), et deux ratios
d'activité. Beaucoup de ces valeurs sont **estimées** (modèle simple), pas réelles.

### 6.8 fact_risque : classes de risque

> Le code ci-dessous montre la VERSION AVANT le fix (le bug `months[:3]`). Après T2,
> la ligne est devenue `for am in months:` — on itère sur les 48 mois.

```python
def build_fact_risque(self, dim_clients, dim_dates):
    months = sorted(set(d["annee_mois"] for d in dim_dates))
    rows = []
    for c in dim_clients:
        cid = c["client_id"]
        score = c.get("score_actuel") or 50
        if score >= 70:
            cls_risk, cls_lib, npl = "A", "Faible", False
        elif score >= 40:
            cls_risk, cls_lib, npl = "B", "Moyen", False
        else:
            cls_risk, cls_lib, npl = "C", "Eleve", True      # NPL = oui
        for am in months[:3]:          # (version avant fix) seulement les 3 premiers mois !
            ...
            rows.append({
                "risque_id": f"RISK-{cid}-{am}",
                "score_risque": score,
                "classe_risque": cls_risk,
                "classe_libelle": cls_lib,
                "npl_flag": npl,
            })
```

Explication :
- **Règle métier** : un score >= 70 → classe A (risque faible, pas NPL) ; >= 40 →
  classe B (moyen) ; sinon classe C (élevé, flag NPL = True).
- **Historique d'un bug (corrigé par T2)** : `months[:3]` ne prenait que les 3
  premiers mois. Corrigé en `for am in months:` → `fact_risque` couvre maintenant les
  48 mois (476 clients x 48 = 22848 lignes).

### 6.9 fact_qualite : mesures CRM par agence

```python
def build_fact_qualite(self, dim_agences, dim_dates):
    silver = self._fetch_silver("silver_qualite")
    valid_aid_set = set(a["agence_id"] for a in dim_agences)
    rows = []
    for s in silver:
        if not s.get("is_valid", True): continue
        aid = s.get("agence_id", "")
        if aid not in valid_aid_set: continue       # agence inconnue -> saute
        ...
        recl_ouvertes = s.get("reclamations_ouvertes") or 0
        recl_traitees = s.get("reclamations_traitees") or 0
        rows.append({
            "qualite_id": s["qualite_id"],
            "note_satisfaction_client": s.get("note_satisfaction_client"),
            "traitement_rate": round((recl_traitees / recl_ouvertes * 100)
                                     if recl_ouvertes > 0 else 100, 2),
        })
```

Explication : copie les mesures de qualité valides, saute celles dont l'agence
n'existe pas, et calcule le **taux de traitement** des réclamations (traitées /
ouvertes x 100). Si aucune réclamation, le taux = 100 % (pas de problème).

### 6.10 Le chargement gold : l'UPSERT

```python
def _upsert_all(self, table, rows, pk):
    for row in rows:
        cols = list(row.keys())
        placeholders = ", ".join([f":{c}" for c in cols])
        col_names = ", ".join(cols)
        updates = ", ".join([f"{c} = EXCLUDED.{c}" for c in cols if c != pk])
        sql = text(f"""
            INSERT INTO {table} ({col_names}) VALUES ({placeholders})
            ON CONFLICT ({pk}) DO UPDATE SET {updates}
        """)
        session.execute(sql, row)
```

Explication : l'**UPSERT** (INSERT + UPDATE si la clé existe déjà). Avec
`ON CONFLICT (clé) DO UPDATE`, si une ligne avec la même clé primaire existe déjà,
on la **met à jour** au lieu d'échouer (un simple INSERT provoquerait une erreur de
doublon). `EXCLUDED` désigne les valeurs proposées dans le INSERT courant. C'est ce
qui rend le gold **rechargeable sans crash**, même si les tables contiennent déjà
des lignes.

### 6.11 Le bilan chiffré (après un run complet)

```
dim_date: 1461        fact_engagement: 1818
dim_client: 476       fact_performance: 480   (10 agences x 48 mois)
dim_agence: 10        fact_risque: 22848      (476 clients x 48 mois - corrige)
dim_type_credit: 5    fact_qualite: 455
dim_utilisateur: 8
```

Note : `fact_risque` = 476 x 48 = 22848 lignes (le bug months[:3] a été corrigé par T2).

---

---

## 7. L'orchestrateur run_pipeline.py

Fichier : `backend/etl/run_pipeline.py`

### 7.1 Pourquoi ce fichier ?

C'est le **cerveau qui pilote tout le pipeline** bronze → silver → gold en une seule
commande. Il a une particularité importante : il lit **une seule fois** le CSV, puis
fait circuler les données **en mémoire** jusqu'au silver, au lieu de relire le CSV à
chaque étape. Cela garantit bronze == silver (même donnée de départ).

### 7.2 L'étape bronze

```python
def step_bronze(bronze_data):
    print("ETAPE 1 - BRONZE (CSV -> PostgreSQL)")
    loader = BronzeLoader()
    loader.create_tables()      # cree les tables si absentes
    loader.truncate_all()       # vide les tables (propre)
    counts = loader.load_all(bronze_data)   # insere tout le CSV
    for table, count in counts.items():
        print(f"  bronze_{table}: {count} lignes")
    return counts
```

Explication : 3 actions : créer les tables si besoin, les vider, puis charger. Le
`bronze_data` est le dictionnaire lu par l'extracteur (il est passé en entrée).

### 7.3 L'étape silver (la plus "intelligente")

```python
def step_silver(bronze_data):
    print("ETAPE 2 - SILVER (validation + dedup depuis le bronze)")
    transformer = SilverTransformer()
    silver_data = transformer.transform_all(bronze_data)   # valide toutes les lignes
    for table, rows in silver_data.items():
        valides = sum(1 for r in rows if r["is_valid"])
        print(f"  silver_{table}: {valides}/{len(rows)} valides")
        invalides = [r for r in rows if not r["is_valid"]]
        for r in invalides[:3]:      # affiche jusqu'a 3 erreurs en exemple
            ...
    loader = SilverLoader()
    loader.create_tables()
    loader.truncate_all()
    counts = loader.load_all(silver_data)
    return counts
```

Explication : on **valide** d'abord toutes les lignes (transform_all), on affiche le
résumé (combien valides / invalides, avec des exemples d'erreur), puis on vide et
charge les tables silver. Notez : le silver est transformé **depuis bronze_data** (en
mémoire), pas en relisant le CSV → cohérence garantie.

### 7.4 L'étape gold : ordre d'assemblage des dimensions

```python
def step_gold():
    print("ETAPE 3 - GOLD (star schema depuis les tables silver)")
    t = GoldTransformer()
    dim_date   = t.build_dim_date()              # d'abord les dimensions
    dim_client = t.build_dim_client()
    dim_agence = t.build_dim_agence()
    dim_tc     = t.build_dim_type_credit()
    dim_user   = t.build_dim_utilisateur()
    fact_eng   = t.build_fact_engagement(dim_client, dim_tc)     # puis les faits
    fact_perf  = t.build_fact_performance(dim_agence, dim_date)
    fact_risk  = t.build_fact_risque(dim_client, dim_date)
    fact_qual  = t.build_fact_qualite(dim_agence, dim_date)
    gold_data = { "dim_date": dim_date, ..., "fact_qualite": fact_qual }
    loader = GoldLoader()
    loader.create_tables()      # DROP + recree (reset complet)
    loader.load_all(gold_data)  # upsert
    ...
```

Explication : on construit **d'abord les dimensions** (client, agence, date, type),
**puis les faits** qui s'y référencent par clé. Certaines fonctions de fait ont
besoin des dimensions en paramètre (pour résoudre les clés : ex. résoudre le libellé
de type en type_credit_id). Le chargement se fait ensuite en **upsert** (pas de
crash sur doublon), car create_tables a déjà tout recré de zéro.

### 7.5 La vérification de cohérence (verify)

```python
def verify():
    with engine.connect() as conn:
        tables = ["bronze_qualite", "silver_qualite", "fact_qualite", ...]
        for table in tables:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar() or 0
            print(f"  {table}: {count}")
        bronze_valid = conn.execute(text(
            "SELECT COUNT(*) FROM silver_qualite WHERE is_valid = TRUE")).scalar() or 0
        print(f"  -> silver_qualite is_valid: {bronze_valid}")
```

Explication : après le pipeline, on affiche le **compte de chaque table** (bronze,
silver, gold) et le nombre de lignes valides du silver. Cela permet de contrôler
visuellement que tout est cohérent (ex: bronze_clients 499, silver_clients 500,
dim_client 476). C'est un mini contrôle qualité à la fin du run.

### 7.6 La fonction principale et le CLI --step

```python
def main():
    args = sys.argv[1:]
    only = None
    if "--step" in args:
        only = args[args.index("--step") + 1]   # la valeur après --step
    if only and only not in ("bronze", "silver", "gold"):
        print(f"Etape inconnue : {only} (bronze | silver | gold)")

    bronze_data = BronzeExtractor().extract_all()   # on lit LES CSV UNE SEULE FOIS
    try:
        if only in (None, "bronze"): step_bronze(bronze_data)
        if only in (None, "silver"): step_silver(bronze_data)
        if only in (None, "gold"):   step_gold()
    except Exception as exc:
        print(f"[ERREUR] Pipeline interrompu : {exc}")
        sys.exit(1)          # code de sortie != 0 -> signaler l'echec
    verify()
```

Explication :
- `--step bronze` ne lance que le bronze ; sans `--step` on lance tout.
- `except Exception ... sys.exit(1)` : si une étape casse, on **s'arrête** et on
  renvoie un code d'erreur non nul (pour un planificateur futur).
- La sortie est propre et imprimée étape par étape → utile pour un planificateur futur (cron).

### 7.7 Usage réel

```bash
cd backend
venv\Scripts\python.exe -m etl.run_pipeline                # tout
venv\Scripts\python.exe -m etl.run_pipeline --step gold    # une seule étape
```

---


---

## 8. Full load vs Incremental (question d'entretien)

### 8.1 Réponse de ce projet : **FULL LOAD**

On **reconstruit tout** à chaque exécution :
- bronze : `truncate_all()` puis `load_all()` → tout est revidé et réinséré.
- silver : idem (truncate + insert).
- gold : `create_tables()` (DROP + recréation) puis **upsert**.

### 8.2 Pourquoi du full load ici

Les données sont petites (500 clients, 2000 engagements). L'incrémental n'apporterait
rien de plus et compliquerait le code. Le full load est simple, fiable, et chaque run
produit un état propre à partir d'un même CSV → cohérence garantie.

### 8.3 Quand passer en incremental (pour progresser)

Quand les données deviennent volumineuses ou continues :
- ajouter un **watermark** (`SELECT MAX(ingested_at) ...`) pour ne charger que le
  nouveau ;
- planifier avec **Airflow** (DAG mensuel/quotidien).

`run_pipeline.py` est déjà conçu pour être appelé par un planificateur : sortie
propre, `--step`, code de retour != 0 en erreur.

---

## 9. Le backend FastAPI : l'API

### 9.1 L'entrée de l'application — `main.py`

```python
app = FastAPI(title="Saham Bank Analytics Portal API", version="1.0.0",
              docs_url="/docs", redoc_url="/redoc")
app.add_middleware(CORSMiddleware,
                   allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

Explication :
- `FastAPI(...)` : crée l'application ; `/docs` est la **documentation interactive**
  autogénérée (Swagger) — très utile pour tester l'API dans le navigateur.
- `CORSMiddleware` : autorise le **navigateur** du frontend à appeler l'API. 
  `allow_origins=["*"]` accepte tous les domaines (pratique en local, mais à
  restreindre en production, voir chantier sécurité).
- `GZipMiddleware` : compresse les réponses > 1 Ko (réseau plus léger).

```python
@app.on_event("startup")
async def startup_event():
    init_db()           # cree les tables ORM au demarrage (users, clients, ...)
@app.on_event("shutdown")
async def shutdown_event():
    engine.dispose()    # ferme proprement les connexions

@app.get("/")          -> {"message": "Saham Bank Analytics Portal API", "version": "1.0.0"}
@app.get("/health")    -> {"status": "healthy"}
```

Explication : au démarrage on initialise la base (les tables SQLAlchemy "ORM", qui
sont séparées des tables ETL : users, clients, agences, engagements de l'application
opérationnelle). `/health` permet aux hébergeurs de vérifier que l'API est vivante.

```python
app.include_router(auth.router,      prefix="/auth",       tags=["Authentification"])
app.include_router(clients.router,   prefix="/clients",    tags=["Clients"])
app.include_router(engagements.router, prefix="/engagements", tags=["Engagements"])
app.include_router(agences.router,   prefix="/agences",    tags=["Agences"])
app.include_router(gold.router,      prefix="/gold",       tags=["Gold Warehouse"])
```

Explication : on enregistre les **routers** (groupes de routes), chacun sous un
préfixe. Toutes les routes du gold seront sous `/gold/...` par exemple. C'est le
découpage REST de l'API.

### 9.2 La configuration — `config.py`

```python
class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., env="DATABASE_URL")      # chaine de connexion
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    LLM_PROVIDER: str = Field("groq", env="LLM_PROVIDER")  # groq | ollama | mock
    SQL_MAX_ROWS: int = Field(100, env="SQL_MAX_ROWS")
    class Config:
        env_file = ".env"     # lit les valeurs depuis le fichier .env
        case_sensitive = True
settings = Settings()
```

Explication : la **bibliothèque Pydantic Settings** lit les variables depuis le
fichier `.env`. Le contrôleur : les valeurs sensibles (DATABASE_URL, SECRET_KEY,
clés API) NE sont pas dans le code, elles viennent de l'environnement. C'est une
bonne pratique de sécurité. `...` = valeur obligatoire ; si absente, erreur au
démarrage (on sait vite qu'il manque une config).

### 9.3 La base de données — `database.py`

```python
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True,
                       pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

Explication :
- `engine` : le **moteur** SQLAlchemy (la connexion à PostgreSQL). `pool_size`/
  `max_overflow` = taille du pool de connexions. `pool_pre_ping` vérifie que la
  connexion est vivante avant usage (robustesse).
- `SessionLocal` : la **fabrique de sessions** pour parler à la base.
- `get_db()` : une **dépendance FastAPI** qui ouvre une session, la donne à la
  route, et la **ferme toujours** à la fin (même si erreur). C'est le pattern
  standard pour gérer les transactions.

### 9.4 Les endpoints du gold (`routers/gold.py`) — LE cœur des dashboards

Tout passe par ce petit helper :

```python
def run_sql(q, params=None):
    with engine.connect() as conn:
        rows = conn.execute(text(q), params or {}).fetchall()
        return [dict(r._mapping) for r in rows]   # chaque ligne -> dict JSON
```

Explication : exécute un SQL brut et transforme les lignes en liste de dictionnaires
JSON. C'est le mode "SQL direct vers JSON" utilisé par les dashboards (les données
sont déjà agrégées dans le gold).

#### /gold/kpis — les 4 chiffres en haut de page

```sql
SELECT
    COUNT(DISTINCT fc.client_id) AS total_clients,
    COALESCE(SUM(fc.montant), 0) AS total_encours,
    (SELECT COALESCE(AVG(npl_ratio), 0) FROM fact_performance) AS npl_moyen,
    COUNT(DISTINCT fa.agence_id) AS total_agences
FROM fact_engagement fc
JOIN dim_agence fa ON fc.agence_id = fa.agence_id
```

Explication :
- `COUNT(DISTINCT fc.client_id)` : nombre de clients **distincts** (un client peut
  avoir plusieurs engagements).
- `COALESCE(SUM(...), 0)` : somme des montants (tout l'encours), et 0 si vide
  (évite un NULL).
- La sous-requête `AVG(npl_ratio)` : le **taux NPL moyen** sur les performances.
- `JOIN dim_agence` : on ne compte que les clients dont l'agence existe.

Résultat réel (avec le seed actuel) : `{"total_clients": 465, "total_encours": 934568026.25,
"npl_moyen": 13.69, "total_agences": 10}`.

#### /gold/pnb-mensuel — le graphique PNB par mois

```python
@router.get("/pnb-mensuel")
async def pnb_mensuel(annee: Optional[int] = None):
    q = """
        SELECT dd.annee_mois, SUM(fp.pnb) as pnb
        FROM fact_performance fp
        JOIN dim_date dd ON fp.date_id = dd.date_id
    """
    if annee:
        q += f" WHERE dd.annee = {annee}"
    q += " GROUP BY dd.annee_mois ORDER BY dd.annee_mois"
    return run_sql(q)
```

Explication : agrège le **PNB par mois** (toute la période, ou filtré par année via
le paramètre GET `?annee=2026`). Le frontend l'utilise pour le graphique en barres
avec son sélecteur d'année.

> Limite de sécurité : l'année est insérée dans le SQL par concaténation
> (`f" WHERE dd.annee = {annee}"`). C'est un risque d'injection (chantier à
> améliorer en paramètre `:annee`). À mentionner honnêtement.

#### /gold/credits-par-type — le doughnut

```python
SELECT dtc.libelle as label, COUNT(*) as value
FROM fact_engagement fe
JOIN dim_type_credit dtc ON fe.type_credit_id = dtc.type_credit_id
GROUP BY dtc.libelle ORDER BY value DESC
```

Explication : compte le nombre d'engagements par type de crédit (pour le camembert).

#### /gold/performance-agences — le tableau des performances

```python
SELECT da.nom as agence, da.ville, da.region,
       AVG(fp.pnb) as pnb_moyen,
       AVG(fp.npl_ratio) as npl_ratio,
       AVG(fp.nim) as nim_moyen,
       AVG(fp.ratio_realisation) as ratio_realisation
FROM fact_performance fp
JOIN dim_agence da ON fp.agence_id = da.agence_id
GROUP BY da.nom, da.ville, da.region
ORDER BY pnb_moyen DESC
```

Explication : agrège par agence les moyennes des indicateurs de performance, trié
par PNB moyen décroissant (les meilleures agences d'abord).

#### Les autres endpoints

- `/gold/clients-par-statut` : nb de clients par statut (actif / à risque / défaut).
- `/gold/engagements-par-statut` : nb d'engagements par statut.
- `/gold/risque-par-classe` : nb de dossiers NPL (npl_flag = true) par classe de risque.
- `/gold/qualite-agences` : satisfaction moyenne, réclamations, délai par agence.

### 9.5 Les routes CRUD (clients, engagements, agences)

Ce sont des CRUD REST classiques (GET / GET /{id} / POST / PUT / DELETE) sur les
tables ORM "opérationnelles" (distinctes des tables ETL). Exemple typique :

```python
@router.get("/", response_model=List[ClientResponse])
async def list_clients(db: Session = Depends(get_db)):
    return db.query(Client).all()   # SELECT * FROM clients
```

Explication :
- `Depends(get_db)` : ouvre/ferme automatiquement la session (voir database.py).
- `response_model=List[ClientResponse]` : Pydantic valide et formate la réponse.

> À noter : ces routes CRUD opèrent sur des tables ORM à part, PAS sur le gold. Elles sont là pour la partie "gestion opérationnelle" (gestion des clients), séparée du
> data warehouse d'analyse.

---

### 9.6 Comment un graphique se remplit (le trajet exact, de la base à l'écran)

Question fréquente : « comment le frontend récupère les infos pour chaque graphique ? »
Voici le chemin complet, identique pour tous les graphiques "vraies données" du portail.

**Étape 1 — Le frontend appelle l'API avec un Bearer token**

`frontend/index.html` expose une fonction `apiGet(path, auth)` (une simple enveloppe
autour de `fetch`) qui envoie `Authorization: Bearer <token>` (le token JWT stocké
dans `localStorage` par le login, voir §10.4). Exemple d'appel (réel, dans
`renderDashboard`) :

```js
const pnbData = await apiGet('/gold/pnb-mensuel?annee=2024', true) || [];
```

**Étape 2 — Le backend exécute le SQL et renvoie du JSON**

Dans `routers/gold.py`, l'endpoint (protégé par `Depends(get_current_user)`)
exécute une requête agrégée et renvoie une liste de `dict` sérialisée en JSON.
Exemple réel pour le PNB mensuel (`/gold/pnb-mensuel`) :

```python
@router.get("/pnb-mensuel")
async def pnb_mensuel(annee: Optional[int] = None):
    q = """
        SELECT dd.annee_mois, SUM(fp.pnb) as pnb
        FROM fact_performance fp
        JOIN dim_date dd ON fp.date_id = dd.date_id
    """
    if annee:
        q += " WHERE dd.annee = :annee"
    q += " GROUP BY dd.annee_mois ORDER BY dd.annee_mois"
    return run_sql(q, params)   # [{"annee_mois": "2024-01", "pnb": 12.3}, ...]
```

**Étape 3 — Le frontend transforme en `labels` + `values`**

Chaque fonction de rendu du portail (ex. `renderDashboard`) applique la même
recette : un tableau `labels` (les axes X / les noms des parts) et un tableau
`values` (les montants dans le même ordre) :

```js
const labels = data.map(d => d.annee_mois);   // ['2024-01', '2024-02', ...]
const values = data.map(d => d.pnb);          // [12.3, 14.1, 13.8, ...]
```

**Étape 4 — Chart.js dessine (et la couleur = position, pas le label)**

Les `labels`/`values` sont passés à `new Chart(ctx, { type, data: { labels, datasets: [...] } })`.
La couleur d'une tranche de camembert (ou d'une barre) est **attribuée par index
(position dans le tableau)**, PAS par libellé : la 1ʳᵉ couleur de la palette ↔ la 1ʳᵉ
valeur, la 2ᵉ couleur ↔ la 2ᵉ valeur, etc. Si les données changent, chaque couleur
« suit » sa position, pas son label. D'où l'intérêt de garder un ordre stable
(`ORDER BY`) dans le SQL.

> À retenir pour la soutenance : `labels` et `values` sont **toujours synchronisés
> par position** ; la palette couvre 1 couleur par part ; si on a plus de parts que
> de couleurs, Chart.js recycle la palette.

---

---

---

## 10. La sécurité et l'authentification

### 10.1 Le modèle User (ORM)

Fichier : `backend/app/models/user.py`

```python
class UserRole(enum.Enum):
    DG = "DG"; DR = "DR"; CA = "CA"; AR = "AR"; ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"
    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    hashed_password = Column(String(255), nullable=True)
```

Explication : un utilisateur a un email (unique), un **rôle** (parmi les 5 roles
hierarchiques), un drapeau `is_active`, et `hashed_password` = **jamais le mot de
passe en clair**, toujours son hachage. `SQLEnum` stocke l'enum en base.

### 10.2 Les utilitaires de sécurité — `core/security.py`

#### Hachage des mots de passe (bcrypt)

```python
def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
```

Explication : **bcrypt** est un algorithme de hachage conçu pour les mots de passe :
lent de propos (brute-force plus dur), avec un "sel" aléatoire. On ne stocke JAMAIS
le mot de passe en clair ; on compare les hachages. `hash_password` sert à
l'inscription, `verify_password` au login.

#### Les helpers PKCE (pour OAuth 2.0 + PKCE, à brancher)

```python
def generate_code_verifier():
    return secrets.token_urlsafe(32)               # valeur aléatoire secrète

def generate_code_challenge(code_verifier):
    hash_bytes = hashlib.sha256(code_verifier.encode()).digest()
    return base64.urlsafe_b64encode(hash_bytes).decode().rstrip("=")

def verify_code_challenge(code_verifier, code_challenge):
    return generate_code_challenge(code_verifier) == code_challenge
```

Explication : PKCE (Proof Key for Code Exchange) -> pour un flow OAuth côté mobile
ou SPA. On envoie un `code_challenge` (dérivé du verifier) au serveur d'autorisation
sans exposer le secret, puis on prouve qu'on possède le `code_verifier`. Ces
fonctions préparent ce flow mais le vrai **OAuth n'est pas encore branché** (le
chantier est en attente).

#### Les tokens JWT

```python
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30

def create_access_token(data, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

Explication : un **JWT** est un jeton signé avec `SECRET_KEY` (algorithme HS256). Il
contient des revendications (`sub`, `role`, `exp`) + une signature qui prouve qu'on
ne l'a pas falsifié. Deux durées : access token = 15 min (côté chaque requête),
refresh token = 30 jours (pour renouveler sans redemander le mot de passe).
`decode_access_token` vérifie la signature ET que le type est "access".

### 10.3 Le router auth (`routers/auth.py`)

```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

@router.post("/register")
async def register(user: UserCreate, db=Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(400, "Email déjà utilisé")
    db_user = User(id=f"USR-{db.query(User).count()+1:05d}",
                   email=user.email, nom=user.nom, role=user.role,
                   hashed_password=hash_password(user.password), is_active=True)
    db.add(db_user); db.commit()
```

Explication : `register` vérifie que l'email est libre, crée l'utilisateur avec le
mot de passe **haché** (`hash_password`), puis le sauvegarde.

```python
@router.post("/login")
async def login(credentials, db=Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    if not user.is_active:
        raise HTTPException(403, "Compte désactivé")
    access_token = create_access_token({"sub": user.id, "role": user.role.value})
    refresh_token = create_refresh_token(user.id)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, expires_in=900)
```

Explication : `login` vérifie l'email + le mot de passe. En cas de succès il renvoie
un **access token** (15 min) + un **refresh token** (30 j). `sub` = l'id de
l'utilisateur, `role` = son rôle (sera utilisé pour les permissions).

```python
@router.get("/me")   # protege par le token
async def get_current_user(token=Depends(oauth2_scheme), db=Depends(get_db)):
    payload = decode_access_token(token)
    if not payload: raise HTTPException(401, "Token invalide ou expiré")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user: raise HTTPException(404, "Utilisateur non trouvé")
    return user
```

Explication : `/me` exige un token ; on le décode, on retrouve l'utilisateur par son
`sub` et on le renvoie. C'est la route "profil" de l'utilisateur connecté.

### 10.4 Le constat honnête (à connaître absolument pour la soutenance)

1. Le backend **a** l'authentification JWT (login, refresh, me), le hachage bcrypt
   et des helpers PKCE prêts.
2. Le frontend l'utilise depuis **T4** : `login(role)` appelle `/auth/login`
   (vérification bcrypt), stocke l'access token, et `logout()` le purge.
3. Depuis la **Sécurité API**, les endpoints du gold / clients / engagements /
   agences sont protégés par `Depends(get_current_user)` (Bearer JWT) : sans token →
   **401**. Le CORS est restreint à des origines configurées et le SQL de
   `pnb-mensuel` est paramétré.

---

---

## 11. Le frontend : le portail web

Fichier : `frontend/index.html` (un seul fichier de ~3600 lignes).

### 11.1 Architecture (limite assumée)

Le frontend est un **fichier unique** qui contient tout : CSS inline, JavaScript
métier, données simulées, et Chart.js (importé via CDN).

> Limite assumée d'un POC : un seul fichier, pas de composants, pas de build
> moderne. Le standard production serait de découper en composants (React/Vue).
> Le `vite.config.ts` existe mais le code réel est du JS vanilla dans le HTML.

### 11.2 L'accès à l'API — API_BASE

```javascript
const API_BASE = 'http://localhost:8000';
async function apiGet(path) {
    try {
        const r = await fetch(API_BASE + path);
        if (!r.ok) return null;
        return await r.json();
    } catch (e) { return null; }
}
```

Explication : `apiGet` appelle l'API et renvoie le JSON, ou `null` si erreur (pour
ne pas faire planter la page). `API_BASE` est **codée en dur** sur localhost:8000 ;
pour le déploiement en ligne, elle devra devenir configurable (chantier 13).

### 11.3 Les données MOCK (à savoir distinguer)

Un gros objet `MOCK` contient des données simulées (agences, segments, clients,
pnbData, creditDistrib, admins, queries...). Il est utilisé là où l'API réelle n'est
**pas** branchée : le login (sélecteur de rôle), l'historique des requêtes du
chatbot, certains écrans.

> Pour la soutenance : être capable de dire que les KPI du tableau de bord viennent
> de l'**API réelle** (via /gold/...), mais que l'historique du chatbot et le login
> utilisent du **mock**.

### 11.4 renderDashboard — la partie "vraies données"

```javascript
const kpis = await apiGet('/gold/kpis') || {};
const pnbData = await apiGet('/gold/pnb-mensuel') || [];
const credData = await apiGet('/gold/credits-par-type') || [];
const agPerf = await apiGet('/gold/performance-agences') || [];
const qualData = await apiGet('/gold/qualite-agences') || [];
```

Explication : au chargement du dashboard, on appelle 5 endpoints réels du gold. Les
réponses alimentent les 4 chiffres clés et les graphiques. `|| {}` / `|| []` : si
l'API répond mal, on utilise un objet/vide vide plutôt que de crasher.

### 11.5 Le ChartManager (l'encapsulation de Chart.js)

```javascript
// fonctions : initBarChart, initDoughnutChart, initHorizontalBarChart, initLineChart...
tooltip: { callbacks: {
    label: (c) => `${c.label}: ${(c.raw / total) * 100}%`   // vrai pourcentage
}}
```

Explication : le code crée des **fonctions wrapper** autour de Chart.js pour éviter
de dupliquer la configuration (couleurs, axes, légendes, tooltips). L'exemple ci-
dessus affiche un pourcentage réel dans l'info-bulle du camembert.

### 11.6 Le graphique PNB + le sélecteur d'année

```javascript
const moisFR = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];
window.filtrerPNB = function(annee) {
    const data = annee && annee !== 'toutes'
        ? pnbFullData.filter(d => d.annee_mois.startsWith(String(annee)))
        : pnbFullData;
    // ... redessine le graphique Chart.js
};
```

Explication : `moisFR` sert à afficher les mois en français. `filtrerPNB(annee)`
filtre les données PNB par l'année choisie (ou toutes si "toutes") puis redessine le
graphique. `startsWith("2026")` fonctionne car `annee_mois` a le format "2026-03".

### 11.7 renderPowerbi — le module "PNB Commercial"

- Se charge en async, interroge `/gold/pnb-mensuel`.
- Génère la liste des années disponibles (2023-2026) depuis les données.
- Filtre par année / mois / jour.
- Affiche un **bandeau de filtres actifs** + un bouton Réinitialiser.

> Honnêteté : ce n'est PAS un vrai Power BI embarqué, c'est un module HTML/Chart.js
> maison qui imite le style. À dire clairement en soutenance.

### 11.8 renderAdmin — la console d'administration

Onglets : Utilisateurs, Accès, Dashboards, Config Power BI, Config Filtres, et
**Historique des requêtes SQL du Chatbot** (`admin-queries`). Ce dernier onglet
affiche un tableau (date, utilisateur, question, SQL généré, résultats, temps) —
actuellement avec `MOCK.queries`. Le chantier RAG le branchera sur la vraie table
`ai_query_log`.

### 11.9 renderChatbot — le chatbot

Le chatbot a des **presets** (questions fréquentes) et une zone de chat + input.
`sendMainChat()` simule actuellement des réponses avec du SQL mock et des tableaux
MOCK. Le chantier RAG le branchera sur l'API réelle `/ai/chat`.

**Comportement des messages (choix produit, appliqué sur les 3 variantes de chat)** :
- Pendant le traitement : un message avec des **points animés** (« Analyse de votre
  question… » / « Analyse des données de la banque… »), masqué ensuite.
- La réponse : un **résumé texte** + un **tableau** des résultats.
- Le **SQL généré n'est plus affiché** dans la conversation (ni un bouton
  « Voir la requête SQL »), et les **sources de données ne sont plus listées**.
- Le SQL reste cependant **journalisé** dans l'onglet admin (Historique des
  requêtes SQL, via `MOCK.queries`) pour la traçabilité sans polluer l'interface
  utilisateur.

Couleur des tranches : les graphiques du portail attribuent leur couleur **par
position (index)** dans la palette, pas par libellé (voir §9.6).

### 11.10 Le login (réel depuis T4)

```javascript
function login(role) {
    // role = carte cliquée (DG, DR, CA, AR, Admin)
    const email = demoAccounts[role];            // ex: "dg@sahambank.ma"
    fetch(API_BASE + '/auth/login', { method: 'POST', body: {email, password} })
        .then(r => r.json())
        .then(data => {
            localStorage.setItem('saham_access_token', data.access_token);
            APP.userRole = role;
            // ... afficher le portail + navigation selon le role
        })
}
```

Explication : depuis **T4**, `login(role)` appelle le vrai `POST /auth/login` avec un
compte démo (email par rôle, mot de passe `Demo2026!`), vérifie le mot de passe en
bcrypt côté serveur, puis stocke l'**access token** (JWT, 15 min) dans
`localStorage`. `logout()` supprime ce token. Le backend a déjà `/auth/login`,
`/auth/refresh` et `/auth/me`.

### 11.11 Comprendre les tests (le dossier backend/tests)

> But de cette section : expliquer **concrètement** à quoi servent les tests du
> projet, en prenant les vrais fichiers `backend/tests/*.py` comme exemples.
> C'est une question classique de soutenance : « qu'est-ce que vous avez testé,
> et comment ? ».

#### 11.11.1 L'idée en une phrase

Un test est une **petite recette automatisée** : on lance une action (appeler une
route de l'API, exécuter un `SELECT`), et on **vérifie** (`assert`) que le résultat
correspond à ce qu'on attend. Si une vérification échoue, le test devient **rouge**
et la CI s'arrête : on sait immédiatement qu'on a cassé quelque chose.

`pytest` est l'outil qui scanne `backend/tests/`, exécute chaque fonction
préfixée `test_` et affiche le bilan (ex. `25 passed`).

#### 11.11.2 Les 3 ingrédients d'un test

Extrait réel de `tests/test_auth.py` :

```python
def test_login_ok(client, email):
    r = client.post("/auth/login", json={"email": email, "password": "Demo2026!"})
    assert r.status_code == 200        # <-- la vérification
```

1. **L'action** : `client.post(...)` appelle la vraie route `/auth/login` comme le
   ferait un navigateur (sans lancer de serveur : c'est le TestClient FastAPI).
2. **La vérification** : `assert r.status_code == 200` = « je jure que la réponse
   est 200 ». Si le serveur répond 401/500, le test échoue.
3. **Le nom** : `test_login_ok` décrit ce qu'on vérifie (visible dans la sortie).

#### 11.11.3 Les 4 fichiers et ce qu'ils testent

| Fichier | Type | Ce qu'il vérifie |
|---|---|---|
| `test_health.py` | smoke (base) | l'API démarre : `/health`, `/`, `/docs` répondent 200 |
| `test_auth.py` | API / intégration | login OK pour les 5 rôles, mauvais mot de passe refusé, token JWT valide via `/auth/me` |
| `test_gold.py` | API protégée | les endpoints du gold renvoient **401 sans token**, **200 avec** un Bearer démo |
| `test_etl_coherence.py` | données / base | le warehouse contient les bons chiffres (ex. fact_risque = 476×48 lignes, aucune ville "Ville-X") |

#### 11.11.4 Les notions clés illustrées par le projet

- **Fixture** (`conftest.py`) : objet fabriqué automatiquement et passé aux tests.
  `client` = TestClient de l'app ; `db_engine` = connexion SQLAlchemy ; `auth_header`
  = un vrai token JWT obtenu par login démo.
- **`@pytest.mark.parametrize`** (`test_auth.py`) : exécute le **même test
  plusieurs fois** avec des valeurs différentes. D'où les `test_login_ok[dg@...]`,
  `[...dr@...]`… dans la sortie pytest (5 exécutions pour 5 comptes démo).
- **`db_available`** (`conftest.py`) : si PostgreSQL n'est pas joignable, les tests
  d'intégration **sautent** (`pytest.skip`) au lieu d'échouer → la CI ne casse pas
  sur une machine sans base.
- **Assertion avec message** (`test_etl_coherence.py`) :
  `assert mois == 48, f"fact_risque ne couvre que {mois} mois (T2 non appliqué)"`
  → si le test échoue, le message explique le contexte (quel chantier est en cause).

#### 11.11.5 Pourquoi la CI lance l'ETL avant pytest

Les tests `test_etl_coherence.py` et `test_gold.py` lisent la **vraie base**
(`SELECT COUNT(*) FROM dim_client`…). Ils ne sont pas isolés du monde : ils
prouvent que le pipeline ET les données sont bons. C'est pourquoi le workflow
`.github/workflows/ci.yml` :
1. démarre un **service PostgreSQL** (conteneur jetable),
2. exécute `python -m etl.run_pipeline` + `python -m app.seed_demo`,
3. lance `pytest`.

Résultat : 25 tests sur de **vraies données**, pas des valeurs truquées.

---

## 12. Le module RAG / Chatbot IA (en cours)

> Statut : les briques backend sont **créées** mais le module n'est PAS encore
> branché (pas de routeur `/ai/chat`, pas de branchement frontend). Chantier en
> attente d'autorisation.

### 12.1 C'est quoi le RAG ?

**RAG = Retrieval-Augmented Generation** : "récupération augmentée de génération".

1. **Ingestion** : on découpe les documents en **chunks** → on calcule un
   **embedding** (vecteur) pour chaque chunk → on le stocke dans **pgvector**.
2. **Question** : on calcule l'embedding de la question → on cherche les chunks les
   plus proches (similarité cosinus) → on les donne au LLM comme contexte → le LLM
   répond avec ce contexte (il ne "sait" pas les chiffres, il lit le contexte).

### 12.2 Le Text-to-SQL (le 2e cerveau du chatbot)

1. On donne au LLM le **schéma** des tables gold + la question naturelle.
2. Le LLM **génère le SQL** (jamais l'utilisateur).
3. Sécurité : exécution **read-only** stricte (voir §12.4).
4. Le LLM reformule le résultat **en langage naturel** + éventuellement une spec de
   **graphe** (Chart.js : type, labels, datasets, légende).
5. **Logs** : question + SQL + durée + succès dans `ai_query_log`.

### 12.3 L'abstraction LLM (le point de design)

Fichier : `backend/app/services/rag/llm.py`

```python
class LLMClient:
    def _build_provider(self):
        name = settings.LLM_PROVIDER.lower()
        if name == "groq":   return GroqProvider()    # API cloud (Llama-3.3-70B)
        if name == "ollama": return OllamaProvider()  # local, hors-ligne
        if name == "mock":   return MockProvider()    # démo sans LLM
        raise ValueError(...)
    def complete(self, prompt, system=None, temperature=0.2):
        messages = []
        if system: messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        return self.provider.complete(messages, temperature=temperature)
```

Explication : c'est le **pattern stratégie** appliqué aux LLM. Le reste du code
n'appelle que `complete()` / `complete_json()`, jamais le SDK d'un fournisseur. Pour
changer de fournisseur, on modifie UNE variable du `.env` (`LLM_PROVIDER`).

- `GroqProvider` : appelle l'API cloud Groq (rapide, gratuit à faible volume).
- `OllamaProvider` : appelle Ollama en local (hors-ligne) — utile si on ne veut rien
  envoyer sur Internet.
- `MockProvider` : renvoie des réponses codées en dur (pour tester sans LLM).

```python
def complete_json(self, prompt, system=None, temperature=0.0):
    raw = self.complete(prompt, system=system, temperature=temperature)
    return _extract_json(raw)   # extrait le JSON d'une reponse qui peut contenir du texte
```

`_extract_json` enlève les fences ``` et ne garde que le morceau entre `{` et `}`,
puis `json.loads`. Les modèles renvoient parfois du texte autour du JSON.

### 12.4 La sécurité de l'exécution SQL (ESSENTIEL à connaître)

Fichier : `backend/app/services/rag/vector_store.py`

```python
def _check_sql_safety(sql):
    stripped = sql.strip().rstrip(";")
    lowered = stripped.lower()
    if ";" in stripped:
        raise ValueError("une seule requête autorisée (pas de ';')")
    if not (lowered.startswith("select") or lowered.startswith("with")):
        raise ValueError("seulement SELECT/WITH")
    words = set(re.findall(r"[a-z_]+", lowered))
    blocked = words & set(FORBIDDEN_SQL)   # insert, update, delete, drop, ...
    if blocked:
        raise ValueError(f"SQL interdit : {blocked}")
```

Puis l'exécution :

```python
conn = psycopg2.connect(settings.DATABASE_URL)
conn.set_session(readonly=True, autocommit=False)   # la base REFUSE toute ecriture
cur = conn.cursor()
cur.execute(sql)
rows = cur.fetchmany(max_rows)                      # LIMIT imposée
```

Explication des **4 défenses** (à réciter en soutenance) :
1. **Mots-clés interdits** : la liste `FORBIDDEN_SQL` (insert, update, delete, drop,
   alter, truncate, grant, copy...) est bloquée avant exécution.
2. **SELECT/WITH uniquement** : le SQL doit commencer par l'un des deux.
3. **Session READ ONLY** : au niveau du pilote PostgreSQL, la connexion est en
   lecture seule — même si un mot-clé passait, la base refuserait toute écriture.
4. **LIMIT forcée** : si le SQL n'a pas de LIMIT, on en ajoute une (`SQL_MAX_ROWS`,
   100 par défaut) pour ne jamais ramener toute une table.

### 12.5 Le stockage vectoriel pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;    -- active pgvector
CREATE TABLE IF NOT EXISTS ai_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384) NOT NULL,       -- 384 dims (modèle multilingue)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ai_chunks_embedding_idx
    ON ai_chunks USING hnsw (embedding vector_cosine_ops);   -- index de recherche rapide
```

La recherche par similarité :

```sql
SELECT content, 1 - (embedding <=> :emb::vector) AS score
FROM ai_chunks
ORDER BY embedding <=> :emb::vector   -- l'operateur <=> = distance cosinus
LIMIT :top_k;
```

Explication : `<=>` est l'opérateur de **distance cosinus** de pgvector. Plus la
distance est petite, plus les chunks sont proches de la question. `1 - distance` =
score de similarité. `HNSW` est un index de recherche approximative qui accélère
beaucoup la recherche sur de gros volumes.

### 12.6 L'ingestion des documents

Fichier : `backend/app/services/rag/ingestor.py` (aperçu du principe)

```python
def chunk_text(text, size=800, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        last_space = text.rfind(" ", start, end)
        if last_space > start:
            end = last_space                # coupe sur un espace, pas au milieu d'un mot
        chunks.append(text[start:end].strip())
        start = max(end - overlap, start + 1)   # on recule de 100 chars pour ne pas couper
    return chunks
```

Explication : `size` = taille d'un chunk (800 caractères), `overlap` = recouvrement
(100 caractères) pour que les idées coupées en deux restent compréhensibles d'un
chunk à l'autre. On coupe toujours sur un **espace** pour ne pas trancher un mot.

### 12.7 Les modèles de log (`models/ai.py`)

```python
class AIDocument(Base):       # table ai_documents : fichiers ingérés
    filename = Column(String(255), nullable=False)
    source = Column(String(50), default="upload")   # upload | folder | seed
    chunks_count = Column(Integer, default=0)

class AIQueryLog(Base):       # table ai_query_log : journal de toutes les questions
    user_id = Column(String(50))
    question = Column(Text, nullable=False)
    mode = Column(String(20), default="sql")        # sql | rag | hybride
    sql_generated = Column(Text)
    duration_ms = Column(Integer, default=0)
    status = Column(String(20), default="success")  # success | error | no_sql
    error = Column(Text)
    tables = Column(Text)
    answer = Column(Text)
```

Explication : `ai_documents` = fichiers chargés (PDF, Word, Excel, CSV, TXT) et
leur nombre de chunks. `ai_query_log` = la **traçabilité admin** : chaque question,
le SQL généré, le temps pris, le statut, l'erreur. C'est exactement la table qui
alimentera l'onglet "Historique des requêtes SQL" du frontend.

### 12.8 Le format de réponse prévu du chatbot

```json
{
  "answer": "Le montant total des engagements est de 934,6 M MAD.",
  "sql": "SELECT SUM(montant) FROM fact_engagement;",
  "rows": 1,
  "chart": { "type": "bar", "title": "Engagements par agence",
             "labels": ["Casa Anfa", "Rabat Agdal"],
             "datasets": [{ "label": "Montant", "data": [850, 620] }] },
  "sources": ["cahier_des_charges.pdf"]
}
```

Explication : une réponse contient le texte (answer), le SQL exécuté (pour
traçabilité), le nombre de lignes, une **spec de graphe** que le frontend pourra
rendre directement avec Chart.js, et les documents sources utilisés.

---

---

## 13. État d'avancement (fait / en attente)

### 13.1 Ce qui est FAIT et fonctionnel

| Domaine | Détail |
|---|---|
| ETL | 3 couches bronze/silver/gold complètes, validation silver tracée (is_valid + error_message), gold star schema |
| Orchestration | `run_pipeline.py` : full load, idempotent, --step, vérification finale |
| Backend | FastAPI : auth (JWT), CRUD clients/engagements/agences, endpoints gold (kpis, pnb-mensuel, credits-par-type, clients-par-statut, engagements-par-statut, risque-par-classe, performance-agences, qualite-agences) |
| Frontend | Portail complet : KPI (API réelle), graphique PNB + sélecteur d'année, module PNB Commercial (année/mois/jour + filtres), console admin, chatbot (mock) |
| Base | PostgreSQL `saham_bank` : bronze_*, silver_*, gold (dim_* + fact_*), tables ORM (users, clients, agences, engagements) |
| RAG (briques) | llm.py (groq/ollama/mock), embeddings (fastembed), ingestor, vector_store (pgvector + SQL sécurisé), modèles ai_documents/ai_query_log |

### 13.2 Terminé récemment

| Chantier | Détail | État |
|---|---|---|
| **T1 - Fixer le seed** | random.seed(42) dans generate_data + transform_gold → gold **déterministe** | ✅ Vérifié : 2 runs → checksums MD5 identiques |
| **T2 - Bug months[:3]** | fact_risque limité à 3 mois → tous les mois (476 x 48 = 22848 lignes) | ✅ Vérifié en base |
| **T3 - Ville fabriquée** | dim_client.ville "Ville-X" → vraie ville jointe depuis silver_agences | ✅ Vérifié : 10 villes réelles, 0 "Ville-X" |
| **T4 - Login réel** | login() frontend → POST /auth/login (JWT) + 5 comptes démo seedés | ✅ Vérifié : les 5 rôles → 200, mauvais mdp → 401 |
| **Tests pytest** | santé, auth (JWT), endpoints gold, cohérence ETL (T2/T3) | ✅ 25/25 verts |
| **Sécurité API** | endpoints gold/clients/agences/engagements protégés (JWT), CORS restreint, SQL paramétré (pnb-mensuel) | ✅ 401 sans token / 200 avec |

### 13.3 En attente (avec autorisation explicite — VAAS)

| Chantier | Détail | Priorité |
|---|---|---|
| **RAG complet** | routeur /ai/chat, sql_agent, orchestration doc+SQL, ingestion, logs → onglet admin, mini-graphes Chart.js | 1 |
| **Nettoyage** | supprimer les ~150 patchs scripts/, corriger le README (React vs vanilla) | 3 |
| **Docker** | Dockerfile backend + docker-compose (backend + PostgreSQL) | 2 |
| **CI/CD** | GitHub Actions : lint, tests, build | 3 |
| **Déploiement en ligne** | frontend (Vercel) + API (Render) + base (Neon), API_BASE configurable | 1 |
| **Planification ETL légère** | relancer le pipeline en batch quotidien sans Airflow : cron Render / APScheduler (ex. /etl/run à 2h) | 3 |
| **OAuth 2.0 + PKCE** | remplacer le JWT maison par un vrai flux OAuth (helpers déjà prêts) | 2 |

> **Écarté volontairement (pragmatisme) :**
> - **Airflow** : remplacé par une planification légère (cron/APScheduler) car c'est une
>   vraie infra pour juste relancer un pipeline ; on le mentionnera au jury comme
>   évolution si plusieurs pipelines à l'échelle.
> - **Docker frontend** : inutile (fichier HTML statique → Vercel directement).
> - **"Temps réel" des données** : un warehouse bancaire est en **batch** (refresh
>   quotidien), pas en streaming ; le seul aspect "temps réel" est le **RAG/Text-to-SQL**
>   qui interroge la base en direct.
> - **Docker backend** : gardé pour la **portabilité d'équipe** (`docker compose up` sur
>   n'importe quel poste stagiaire/ingénieur), pas pour la mise à l'échelle.

### 13.4 Les limites connues à assumer (NE PAS cacher en soutenance)

1. **Données 100 % simulées** (générateur Faker + 10 % anomalies). Dire
   "simulation réaliste servie par un vrai pipeline ETL".
2. **Login par cartes de rôle avec JWT** : `login(role)` appelle `/auth/login`
   (vraie vérification bcrypt) ; comptes démo `*.sahambank.ma` / `Demo2026!`.
3. **API sécurisée par JWT Bearer** : gold/clients/agences/engagements → 401 sans
   token ; **mais** rôles non granulaires (tout utilisateur connecté voit tout).
4. **Power BI embarqué = placeholder** : HTML/Chart.js maison, pas un vrai iframe.
5. **Frontend monolithe** (1 fichier de 3600 lignes), pas de tests frontend.

---

## 14. Plan de déploiement en ligne (URL)

### 14.1 Le principe : livrer par URL

Oui, un produit web moderne se livre par une URL. Mais derrière ce lien il y a
**3 étages** qui doivent être sur Internet :

```
Navigateur
   |
   v
Frontend (statique)  -> Vercel / Netlify / nginx
   |
   v
API FastAPI          -> Render / Railway / VPS
   |
   v
PostgreSQL           -> Neon / Supabase / RDS
```

> Vercel seul NE SUFFIT PAS : il héberge du statique (index.html), mais l'API
> Python et la base PostgreSQL doivent vivre ailleurs et être joignables par le
> navigateur.

### 14.2 La solution recommandée (simple + gratuite pour la démo)

| Composant | Hébergeur | Rôle |
|---|---|---|
| Frontend index.html | **Vercel** | sert le portail statique |
| API FastAPI | **Render** (service web) | sert /gold/*, /auth/*, /ai/* |
| PostgreSQL | **Neon** (ou Supabase) | la base cloud (avec pgvector si RAG) |
| ETL | ta machine ou CI | DATABASE_URL pointant vers Neon → les données arrivent dans le cloud |

### 14.3 Les prérequis avant de déployer

1. **Rendre API_BASE configurable** (aujourd'hui codé en dur `http://localhost:8000`
   dans index.html:1235). Il faudra passer par l'URL Render en production.
2. **CORS** : déjà restreint via `CORS_ORIGINS` (config + .env) — il suffira d'y
   ajouter l'URL du frontend de production quand elle sera connue.
3. **Créer un .env de production** avec DATABASE_URL -> Neon.
4. **Docker** : un Dockerfile backend (uvicorn) et un docker-compose (backend + db).

### 14.4 Le flux ETL en ligne

```
[Local] python -m etl.run_pipeline (avec DATABASE_URL=neon)
   -> bronze/silver/gold écrits DANS LE CLOUD
   -> Vercel affiche les données du cloud
```

Ou plus propre : l'ETL tourne **dans le cloud** (service Render + planificateur, ou
GitHub Actions sur un horaire) → zéro dépendance à ta machine.

### 14.5 Point d'honnêteté

Pour une **vraie** banque : jamais de données sur un Vercel public avec une API
ouverte. En **POC/démo** ça passe car les données sont simulées. Pour du plus
réaliste : hébergement interne, VPN, pare-feu, HTTPS systématique.

---

## 15. Glossaire pédagogique

| Terme | Définition (simple) |
|---|---|
| **ETL** | Extract, Transform, Load : extraire la source, transformer, charger en base. |
| **Bronze** | 1re couche : copie brute de la source (miroir), règles "dures" (NOT NULL). |
| **Silver** | 2e couche : validation + traçabilité (is_valid, error_message). |
| **Gold** | 3e couche : prête pour l'analyse (star schema). |
| **Star Schema** | dimensions (comment décrire) + faits (ce qu'on mesure). |
| **Dimension** | table de référence (client, agence, date, type de crédit). |
| **Fact** | table de mesures (engagement, performance, risque, qualité). |
| **Data Warehouse** | base centralisée optimisée pour l'analyse. |
| **Full load** | reconstruire tout à chaque exécution (truncate + reload). |
| **Incremental** | ne charger que le nouveau depuis le dernier passage (watermark). |
| **API REST** | interface HTTP pour lire/écrire des données (GET, POST, PUT, DELETE). |
| **JWT** | jeton signé prouvant l'identité (accès court 15 min + refresh long 30 j). |
| **PKCE** | mécanisme OAuth qui protège le secret côté app mobile/SPA. |
| **CORS** | règle du navigateur : quels domaines peuvent appeler l'API. |
| **SAVEPOINT** | point de restauration dans une transaction (sauter une ligne sans casser le lot). |
| **Upsert** | INSERT ... ON CONFLICT DO UPDATE (insérer ou mettre à jour). |
| **RAG** | récupérer des passages pertinents + générer la réponse avec un LLM. |
| **Embedding** | vecteur numérique représentant le sens d'un texte. |
| **pgvector** | extension PostgreSQL pour stocker/chercher des vecteurs. |
| **Similarité cosinus** | mesure de proximité entre deux vecteurs (0..1). |
| **Chunk** | morceau de texte indexé séparément. |
| **Text-to-SQL** | transformer une question naturelle en requête SQL (via LLM). |
| **HNSW** | index de recherche approximative dans un espace vectoriel. |
| **NPL** | Non Performing Loans : créances douteuses (Surveillance, Contentieux). |
| **PNB** | Produit Net Bancaire : marge d'intérêt + commissions (ici estimé à 3,5 %). |
| **NIM** | Net Interest Margin : marge nette d'intérêt (ici 4,5 % des crédits). |
| **PK / FK** | Primary Key (identifiant unique) / Foreign Key (référence vers une autre table). |
| **Déterminisme** | propriété : le même input donne toujours le même output (obtenu grâce à T1, seed fixé) |

---

## 16. Les commandes indispensables

```bash
# Lancer le projet en local (frontend 3000 + API 8000)
npm run dev

# Construire le frontend pour la production
cd frontend && npm run build

# Lancer le pipeline ETL complet
cd backend && venv\Scripts\python.exe -m etl.run_pipeline

# Lancer une seule étape du pipeline
cd backend && venv\Scripts\python.exe -m etl.run_pipeline --step gold

# Générer les CSV (régénérer la source)
cd backend && venv\Scripts\python.exe -m etl.generate_data

# Documentation API (une fois le backend lancé)
# http://localhost:8000/docs
```

---

*Document vivant — chaque chantier terminé enrichit cette bible. Fin de la version
pédagogique.*
