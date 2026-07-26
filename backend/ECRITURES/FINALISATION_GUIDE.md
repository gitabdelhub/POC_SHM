# Guide de Finalisation — Saham Bank Backend
## De Data Engineering Student à Data Engineer

---

## Introduction

Ce guide suppose que :
- ✅ Tu as PostgreSQL installé et pgAdmin qui marche
- ✅ La base `saham_bank` est créée (vide)
- ✅ J'ai déjà implémenté les modèles, routes, sécurité, database.py
- ✅ Les schemas Pydantic et la config sont prêts

**Ton travail ici :** Comprendre, valider, et construire le pipeline Data Engineering qui donne vie au projet.

---

## PARTIE 0 : Comprendre ce que tu as déjà (15 min)

Avant de coder, ouvre ces fichiers et **lis-les**. Pas pour tout retenir, mais pour voir la structure.

### 0.1 Ouvre `app/database.py`

C'est le **pont entre Python et PostgreSQL**. Regarde :

```python
engine = create_engine(settings.DATABASE_URL, ...)
SessionLocal = sessionmaker(...)
Base = declarative_base()
```

**Questions à te poser :**
- Que fait `pool_pre_ping=True` ? (indice : vérifie les connexions mortes)
- À quoi sert `declarative_base()` ? (indice : c'est le parent de tous tes modèles)

### 0.2 Ouvre `app/models/client.py`

Regarde comment une table SQLAlchemy se définit :

```python
class Client(Base):
    __tablename__ = "clients"
    id = Column(String(50), primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    agence_id = Column(String(50), ForeignKey("agences.id"), nullable=False)
    ...
    agence = relationship("Agence", back_populates="clients")
```

**Ce que tu dois comprendre :**
- `Column` = une colonne de la table
- `String(50)` = VARCHAR(50) en SQL
- `ForeignKey` = lien vers une autre table
- `relationship` = lien Python pour naviguer entre objets (pas une colonne SQL)

> 🔑 **Pour un Data Engineer :** Comprendre le schéma = savoir comment les données sont structurées. Si tu ne sais pas comment les données sont produites, tu ne peux pas les ingérer.

### 0.3 Ouvre `app/routers/clients.py`

Regarde comment un endpoint API expose les données :

```python
@router.get("/", response_model=List[ClientResponse])
async def list_clients(..., db: Session = Depends(get_db)):
    query = db.query(Client)
    ...
    return query.offset(skip).limit(limit).all()
```

> 🔑 **Pour un Data Engineer :** L'API est la **source de données** que tu consommeras dans tes pipelines. Comprendre comment elle expose les données t'aide à savoir quoi ingérer.

---

## PARTIE 1 : PostgreSQL — Connexion et Tables (30 min)

### 1.1 Vérifie ta connexion PostgreSQL

Ouvre un terminal (PowerShell) dans `C:\Users\user\Downloads\saham-bank-backend` :

```powershell
.\venv\Scripts\Activate.ps1
python
```

Puis dans Python :

```python
from app.config import settings
print(settings.DATABASE_URL)
```

Tu devrais voir quelque chose comme :
```
postgresql://postgres:postgre_abdel@localhost:5432/saham_bank
```

Maintenant teste une vraie connexion :

```python
from app.database import engine
with engine.connect() as conn:
    print("✅ Connexion réussie à PostgreSQL !")
```

**Si ça marche**, on passe à la suite. **Si ça ne marche pas :**
- Vérifie que PostgreSQL est démarré (Services Windows → PostgreSQL)
- Vérifie le mot de passe dans `.env`
- Relance pgAdmin et vérifie que la base `saham_bank` existe

### 1.2 Crée les tables

Toujours dans Python :

```python
from app.database import init_db
init_db()
print("✅ Tables créées !")
```

Pour vérifier que les tables existent, retourne dans pgAdmin :
- Clic droit sur `saham_bank` → Refresh
- Ouvrir `Schemas` → `public` → `Tables`
- Tu dois voir : `users`, `clients`, `engagements`, `agences`

> 🔑 **Pour un Data Engineer :** `init_db()` exécute `Base.metadata.create_all()` qui lit les modèles SQLAlchemy et génère les `CREATE TABLE` automatiquement. C'est pratique mais en prod on utilise **Alembic** (migrations versionnées).

### 1.3 Explore les tables avec pgAdmin

Ouvre une table, fais clic droit → `View/Edit Data` → `All Rows`. Les tables sont vides pour l'instant, c'est normal.

> 🔑 **Pour un Data Engineer :** Savoir explorer une base vierge, puis peuplée, puis transformée, c'est 50% du métier.

---

## PARTIE 2 : Lancer l'API et Découvrir Swagger (15 min)

### 2.1 Démarre le serveur

Dans un terminal PowerShell :

```powershell
cd C:\Users\user\Downloads\saham-bank-backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8000
```

Laisse ce terminal ouvert.

### 2.2 Ouvre Swagger UI

Va dans ton navigateur : **http://localhost:8000/docs**

Tu vois l'interface Swagger avec tous les endpoints :
- `/auth/*` — Authentification
- `/clients/*` — CRUD clients
- `/agences/*` — CRUD agences
- `/engagements/*` — CRUD engagements

### 2.3 Crée un utilisateur via Swagger

1. Ouvre `POST /auth/register`
2. Clique sur "Try it out"
3. Copie ce JSON :

```json
{
  "email": "admin@sahambank.ma",
  "nom": "Admin Système",
  "role": "ADMIN",
  "password": "password123"
}
```

4. Execute → Tu reçois une réponse 200 avec l'utilisateur créé ✅

Puis vérifie dans pgAdmin : rafraîchis la table `users` → tu vois la ligne.

> 🔑 **Pour un Data Engineer :** L'API que tu utilises ici est la même que le frontend React utilisera. Savoir tester une API avec Swagger = compétence de base.

---

## PARTIE 3 : Le Pipeline ETL — CŒUR DU DATA ENGINEERING (4-6h)

C'est ici que tu deviens vraiment Data Engineer.

### Concept de la Medallion Architecture

```
┌──────────────────────────┐
│       BRONZE (Raw)       │  ← Données brutes depuis Faker
│    Tables: bronze_*      │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│       SILVER (Clean)     │  ← Nettoyées, validées
│    Tables: silver_*      │
└──────────┬───────────────┘
           ↓
┌──────────────────────────┐
│       GOLD (Curated)     │  ← Agrégées, prêtes pour le dashboard
│   Tables: dim_*, fact_*  │
└──────────────────────────┘
```

**Pourquoi 3 couches ?** Chaque couche a un rôle :
- **Bronze** : Sauvegarde exacte de la source (audit, traçabilité)
- **Silver** : Données propres (qualité garantie)
- **Gold** : Données business (réponses aux questions métier)

---

### ÉTAPE 3.1 : Améliore le Provider Faker (20 min)

**Fichier :** `etl/providers/moroccan_provider.py`

Le provider existe déjà avec les listes, mais les distributions ne sont **pas réalistes**. Un Data Engineer doit générer des données qui ressemblent à la réalité.

**Ouvre le fichier** et trouve la méthode `segment_bancaire()` :

```python
def segment_bancaire(self):
    return random.choice(self.SEGMENTS)  # ← Tire aléatoirement POURCENTAGE ÉGAL
```

**Problème :** En réalité, une banque a ~60% de Particuliers, ~30% de PME, etc. Pas 20% chaque.

**À faire :** Remplace cette méthode par :

```python
def segment_bancaire(self):
    segments, weights = zip(*self.SEGMENT_DISTRIBUTION)
    return random.choices(segments, weights=weights, k=1)[0]
```

Pareil pour `score_risque()` — remplace le `random.randint(0, 100)` par une distribution qui dépend du segment :

```python
def score_risque(self, segment: str = None) -> int:
    if segment is None:
        segment = self.segment_bancaire()
    mean_scores = {
        "Particuliers": 65,
        "PME": 55,
        "Professionnels": 70,
        "Grandes Entreprises": 80,
        "Bancassurance": 75
    }
    mean = mean_scores.get(segment, 60)
    return max(0, min(100, int(random.gauss(mean, 15))))
```

> 🔑 **Pour un Data Engineer :** Les données de test doivent refléter la réalité. 60% Particuliers, 30% PME, distributions normales — c'est comme ça qu'on simule des données proches de la production.

---

### ÉTAPE 3.2 : Implémente l'extraction Bronze (45 min)

**Fichier :** `etl/bronze/extract_bronze.py`

#### 3.2.1 Générer les utilisateurs

Complète **`generate_users()`** :

```python
def generate_users(self, count: int = 10) -> List[Dict[str, Any]]:
    users = []
    roles_pool = ["DG", "DR", "CA", "AR", "ADMIN"]
    for i in range(count):
        prenom = self.fake.prenom_marocain()
        nom = self.fake.nom_marocain()
        users.append({
            "id": f"USR-{i+1:05d}",
            "email": f"{prenom.lower()}.{nom.lower()}@sahambank.ma",
            "nom": f"{prenom} {nom}",
            "role": random.choice(roles_pool),
            "is_active": True,
            "created_at": datetime.now().isoformat()
        })
    return users
```

#### 3.2.2 Générer les agences

Complète **`generate_agences()`** :

```python
def generate_agences(self, count: int = 8) -> List[Dict[str, Any]]:
    agences = []
    villes_regions = [
        ("Casablanca", "Casablanca-Settat"),
        ("Rabat", "Rabat-Salé-Kénitra"),
        ("Marrakech", "Marrakech-Safi"),
        ("Fès", "Fès-Meknès"),
        ("Tanger", "Tanger-Tétouan-Al Hoceïma"),
        ("Agadir", "Souss-Massa"),
        ("Oujda", "L'Oriental"),
        ("Kénitra", "Rabat-Salé-Kénitra")
    ]
    for i in range(count):
        ville, region = villes_regions[i]
        agences.append({
            "id": f"AG-{i+1:03d}",
            "nom": f"{ville} {['Centre', 'Anfa', 'Agdal', 'Ville Nouvelle', 'Marina', 'Gueliz'][i % 6]}",
            "ville": ville,
            "region": region,
            "directeur": self.fake.nom_complet_marocain(),
            "telephone": f"+2125{random.randint(10,99)}-{random.randint(100000,999999)}",
            "email": f"agence{i+1:03d}@sahambank.ma",
            "created_at": datetime.now().isoformat()
        })
    return agences
```

#### 3.2.3 Générer les clients

Complète **`generate_clients()`** :

```python
def generate_clients(self, count: int = 100, agences: List[str] = None) -> List[Dict[str, Any]]:
    clients = []
    for i in range(count):
        segment = self.fake.segment_bancaire()
        agence_id = random.choice(agences) if agences else "AG-001"
        score = self.fake.score_risque(segment)
        encours = random.uniform(50000, 5000000)
        if segment == "PME":
            encours = random.uniform(500000, 10000000)
        elif segment == "Grandes Entreprises":
            encours = random.uniform(5000000, 50000000)
        elif segment == "Particuliers":
            encours = random.uniform(10000, 1000000)
        statut = "Actif" if score >= 40 else ("À risque" if score >= 25 else "Défaut")
        clients.append({
            "id": f"CLI-{10000+i+1}",
            "nom": self.fake.nom_complet_marocain(),
            "segment": segment,
            "agence_id": agence_id,
            "encours": round(encours, 2),
            "score": score,
            "statut": statut,
            "email": f"client{i+1}@email.com",
            "telephone": f"+2126{random.randint(10,99)}-{random.randint(100000,999999)}",
            "date_creation": datetime.now().isoformat()
        })
    return clients
```

#### 3.2.4 Générer les engagements

Complète **`generate_engagements()`**. C'est le même pattern que les clients. Je te laisse suivre le pattern.

> 🔑 **Pour un Data Engineer :** Chaque méthode `generate_*` est un **extracteur** — il va chercher des données depuis une source (ici Faker, mais en vrai ce serait une API, un CSV, une BDD...).

---

### ÉTAPE 3.3 : Implémente le chargement Bronze (45 min)

**Fichier :** `etl/bronze/load_bronze.py`

#### 3.3.1 Créer les tables bronze

Complète **`create_tables()`** :

```python
def create_tables(self):
    with self.engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS bronze_users (
                id VARCHAR(50) PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                nom VARCHAR(100) NOT NULL,
                role VARCHAR(20) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS bronze_agences (
                id VARCHAR(50) PRIMARY KEY,
                nom VARCHAR(100) NOT NULL UNIQUE,
                ville VARCHAR(50) NOT NULL,
                region VARCHAR(50) NOT NULL,
                directeur VARCHAR(100),
                telephone VARCHAR(20),
                email VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
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
                telephone VARCHAR(20),
                date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS bronze_engagements (
                ref VARCHAR(50) PRIMARY KEY,
                client_id VARCHAR(50) NOT NULL,
                client_nom VARCHAR(100) NOT NULL,
                type_credit VARCHAR(50) NOT NULL,
                montant DECIMAL(15,2) NOT NULL,
                duree INTEGER NOT NULL,
                taux DECIMAL(5,2) NOT NULL,
                score INTEGER NOT NULL,
                statut VARCHAR(50) NOT NULL,
                date_depot TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                agence_id VARCHAR(50) NOT NULL
            )
        """))
```

#### 3.3.2 Charger les utilisateurs

Complète **`load_users()`** — déjà en exemple dans le guide complet. Tu suis le pattern.

#### 3.3.3 Défis pour toi

Implémente **toi-même** : `load_agences()`, `load_clients()`, `load_engagements()`.

**Pattern :**
```python
def load_xxx(self, data: List[Dict[str, Any]]) -> int:
    session = self.SessionLocal()
    try:
        for item in data:
            session.execute(
                text("INSERT INTO bronze_xxx (col1, col2, ...) VALUES (:col1, :col2, ...)"),
                item
            )
        session.commit()
        return len(data)
    except:
        session.rollback()
        raise
    finally:
        session.close()
```

> 🔑 **Pour un Data Engineer :** Le chargement bronze est l'**ingestion** — première étape de tout pipeline. Les données sont stockées exactement comme elles arrivent.

---

### ÉTAPE 3.4 : Implémente la transformation Silver (45 min)

**Fichier :** `etl/silver/transform_silver.py`

#### 3.4.1 Valider un utilisateur

Complète **`validate_user()`** :

```python
def validate_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
    user["is_valid"] = True
    user["error_message"] = None
    user["ingested_at"] = datetime.now()

    if not user.get("email") or "@" not in user["email"]:
        user["is_valid"] = False
        user["error_message"] = "Email invalide"

    if user.get("role") not in ["DG", "DR", "CA", "AR", "ADMIN"]:
        user["is_valid"] = False
        user["error_message"] = "Rôle invalide"

    return user
```

#### 3.4.2 Défis pour toi

Implémente **toi-même** `validate_agence()`, `validate_client()`, `validate_engagement()`.

**Règles de validation à appliquer :**
- **Agence :** nom pas vide, ville pas vide, région pas vide
- **Client :** nom pas vide, score entre 0 et 100, segment dans la liste, agence_id pas vide
- **Engagement :** montant > 0, durée > 0, taux > 0, score entre 0 et 100

**Questions pédagogiques :**
1. Pourquoi ajouter `is_valid` au lieu de simplement jeter les données invalides ?
2. Pourquoi garder `error_message` ?

> Réponses : 1) Pour l'audit et la traçabilité. 2) Pour savoir pourquoi une ligne a été rejetée.

> 🔑 **Pour un Data Engineer :** La validation est le cœur de la couche Silver. C'est toi qui définis ce qui est "propre". Un pipeline sans validation produit des rapports faux.

---

### ÉTAPE 3.5 : Implémente le chargement Silver (30 min)

**Fichier :** `etl/silver/load_silver.py`

Même pattern que Bronze mais avec des colonnes techniques en plus :

```sql
CREATE TABLE IF NOT EXISTS silver_users (
    ...mêmes colonnes que bronze...,
    is_valid BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Défi pour toi :** Implémente les 4 tables silver (users, agences, clients, engagements) en ajoutant les 3 colonnes techniques.

---

### ÉTAPE 3.6 : Data Modeling Gold — TON DATA MODELING (2h)

**Fichiers :** `etl/gold/dim_agences.py`, `etl/gold/dim_clients.py`, `etl/gold/fact_engagements.py`, `etl/gold/aggregate_kpis.py`

C'est ici que tu décides **toi-même** de la structure. Je ne vais pas te donner tout le code, je vais te guider.

#### 3.6.1 Le concept Star Schema

```
dim_agences ───┐
                ├── fact_engagements
dim_clients ───┘
                    ↓
             fact_kpis (agrégations)
```

**Toi tu décides :** Quelles colonnes dans chaque table.

#### 3.6.2 Dimension Agences — À toi de définir

Ouvre `dim_agences.py`. Tu dois implémenter :

- `create_table()` : Crée `dim_agences` avec `agence_key SERIAL PRIMARY KEY`, `agence_id`, `nom`, `ville`, `region`, `directeur`, etc.
- `transform(silver_agences)` : Mappe les colonnes silver vers dim (ajoute `is_current`, `valid_from`)
- `load(dim_data)` : Insère dans la table

**Guide :** Regarde l'exemple commenté dans le fichier. C'est le même pattern que bronze/silver.

#### 3.6.3 Dimension Clients — À toi de définir

Pareil mais avec une clé étrangère vers `dim_agences` :
```sql
agence_key INTEGER REFERENCES dim_agences(agence_key)
```

#### 3.6.4 Fact Engagements — À toi de définir

La table de faits avec des clés étrangères vers les dimensions :
```sql
client_key INTEGER REFERENCES dim_clients(client_key),
agence_key INTEGER REFERENCES dim_agences(agence_key),
montant DECIMAL(15,2),
duree INTEGER,
...
```

**Calcule aussi :**
- `mois_depot` et `annee_depot` (extraits de `date_depot`)
- `mensualite` approximative

#### 3.6.5 KPIs — À toi de définir

C'est le plus important. **Quels KPIs un Directeur Général de banque veut voir ?**

Exemples :
- Total encours par agence
- Nombre de clients par segment
- Score moyen par agence
- Taux de défaut par segment
- Montant moyen des engagements

**Ton travail :** Dans `aggregate_kpis.py`, écris des requêtes SQL qui agrègent depuis `dim_agences`, `dim_clients`, `fact_engagements`.

> 🔑 **Pour un Data Engineer :** Le data modeling est ta responsabilité. Tu décides comment structurer les données pour qu'elles soient rapides à interroger. Un bon schéma Gold = un dashboard qui répond en 1 seconde.

---

### ÉTAPE 3.7 : Orchestre le pipeline (30 min)

**Fichier :** `etl/etl_pipeline.py`

Implémente la méthode `run()` qui exécute **tout** le pipeline :

```python
def run(self, users_count=10, agences_count=8, clients_count=100, engagements_count=200):
    logger.info("Début du pipeline ETL")

    # 1. BRONZE : Extraire + Charger
    bronze_data = self.bronze_extractor.generate_all(users_count, agences_count, clients_count, engagements_count)
    self.bronze_loader.create_tables()
    self.bronze_loader.truncate_all()
    bronze_counts = self.bronze_loader.load_all(bronze_data)

    # 2. SILVER : Transformer + Charger
    silver_data = self.silver_transformer.transform_all(bronze_data)
    self.silver_loader.create_tables()
    self.silver_loader.truncate_all()
    silver_counts = self.silver_loader.load_all(silver_data)

    # 3. GOLD : Data modeling + Agrégations
    # ... (tu implémentes)

    return {"bronze": bronze_counts, "silver": silver_counts, "gold": gold_counts}
```

---

### ÉTAPE 3.8 : Data Quality — Bonus (30 min)

**Fichier :** `etl/data_quality.py`

Le `DataQuality` classe contient des validateurs **statiques** qui vérifient la qualité. C'est un **rapport** (pas une transformation).

**Ton travail :** Implémente `validate_all(data)` qui appelle chaque validateur et génère un rapport :

```python
report = {
    "users": {"total": len(data["users"]), "valid": 0, "invalid": 0, "errors": []},
    ...
}
```

Puis `generate_quality_report(report)` qui produit un texte formaté comme :

```
=== Rapport de Qualité des Données ===

Users:
  Total : 10
  Valides : 9 (90.0%)
  Invalides : 1 (10.0%)
  Erreurs : Email invalide
```

---

## PARTIE 4 : Tester le Pipeline ETL (15 min)

### 4.1 Crée un script de test

Dans `etl/`, crée un fichier **`run_pipeline.py`** :

```python
from etl.etl_pipeline import ETLPipeline
from loguru import logger

logger.add("pipeline.log", rotation="1 MB")

if __name__ == "__main__":
    pipeline = ETLPipeline()
    result = pipeline.run(
        users_count=5,
        agences_count=5,
        clients_count=50,
        engagements_count=100
    )
    print("Pipeline terminé !")
    print(result)
```

### 4.2 Exécute le pipeline

```powershell
python etl/run_pipeline.py
```

### 4.3 Vérifie dans pgAdmin

Après le pipeline, va dans pgAdmin :
1. Tables `bronze_*` → doivent contenir des données
2. Tables `silver_*` → doivent contenir des données propres
3. Tables `dim_*`, `fact_*` → doivent contenir les données modélisées

Puis fais une requête SQL simple :

```sql
SELECT * FROM dim_clients LIMIT 5;
```

> 🔑 **Pour un Data Engineer :** Voir tes données arriver dans PostgreSQL après un pipeline que tu as construit, c'est le sentiment le plus gratifiant du métier.

---

## PARTIE 5 : Vérifie que l'API fonctionne avec les vraies données (10 min)

1. L'API tourne toujours sur `http://localhost:8000` ?
2. Va sur **http://localhost:8000/docs**
3. Teste `GET /clients/` → tu dois voir les clients du pipeline
4. Teste `GET /agences/` → pareil
5. Teste `GET /engagements/` → idem

Si ça marche, ton backend est **complètement fonctionnel** avec :
- Des vraies données réalistes
- Un pipeline ETL complet
- Une API REST prête pour le frontend
- OAuth 2.0 + PKCE pour la sécurité

---

## Annexe : Questions de compréhension (Auto-évaluation)

Si tu sais répondre à ça, tu es un Data Engineer :

1. **Pourquoi 3 couches (Bronze/Silver/Gold) au lieu d'une seule table ?**
2. **Quelle est la différence entre ETL et ELT ?**
3. **Pourquoi ajouter `is_valid` au lieu de supprimer directement les données invalides ?**
4. **Qu'est-ce qu'une dimension ? Une fact table ?**
5. **Pourquoi un star schema est-il plus performant pour un dashboard qu'une table plate ?**
6. **Quand utiliser Batch Loading plutôt qu'Incremental Loading ?**
7. **Qu'est-ce que SCD Type 2 ? Pourquoi l'utiliser pour `dim_clients` ?**
8. **Si tu devais passer de Faker à une vraie API bancaire, qu'est-ce qui changerait dans ton pipeline ?**

---

## Résumé de ce que tu auras accompli

Quand tu auras fini ce guide, tu pourras dire :

> ✅ J'ai configuré PostgreSQL et créé les tables
> ✅ J'ai généré des données bancaires marocaines réalistes avec Faker
> ✅ J'ai construit un pipeline ETL complet (Bronze → Silver → Gold)
> ✅ J'ai fait du data modeling (dimensions et faits)
> ✅ J'ai défini des KPIs et des règles de qualité
> ✅ J'ai orchestré le pipeline de bout en bout
> ✅ J'ai vérifié que l'API expose correctement les données

**Tu n'es plus un étudiant qui regarde des tutos. Tu es un Data Engineer qui a livré un projet.**

---

---

## PARTIE 6 : Docker, Orchestration & CI/CD — Le Pro en Production (2-3h)

**Pourquoi c'est important :** En soutenance, quand tu diras "le projet tourne dans des conteneurs Docker avec CI/CD GitHub Actions", tu passeras de "stagiaire" à "ingénieur". Et pour l'IA qui consommera ton API, Docker garantit que l'environnement est reproductible.

---

### ÉTAPE 6.1 : Dockerise le Backend FastAPI (45 min)

#### 6.1.1 Comprendre Docker

Docker permet d'emballer ton application avec tout son environnement (Python, dépendances, config) dans une **image**. Cette image peut tourner sur n'importe quelle machine sans installation.

```
┌─────────────────────────┐
│       Conteneur         │
│  ┌───────────────────┐  │
│  │   FastAPI + App   │  │
│  │   Python 3.11     │  │
│  │   requirements    │  │
│  └───────────────────┘  │
│  Ubuntu / Alpine Linux  │
└─────────────────────────┘
```

#### 6.1.2 Crée le Dockerfile

À la racine du projet `saham-bank-backend`, crée un fichier **`Dockerfile`** :

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Installe les dépendances système (nécessaires pour psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Copie d'abord requirements (cache Docker optimisé)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Puis le code
COPY . .

# Port exposé
EXPOSE 8000

# Commande de démarrage
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Ce que tu dois comprendre :**
- `FROM python:3.11-slim` = image de base (Python 3.11 légère)
- `WORKDIR /app` = dossier de travail dans le conteneur
- Chaque `RUN` ou `COPY` crée une **couche** (layer) — l'ordre impacte la taille et le temps de build
- On copie `requirements.txt` avant le code pour profiter du cache (si requirements change pas, Docker réutilise la couche)

---

### ÉTAPE 6.2 : Docker Compose — Lier Backend + PostgreSQL (30 min)

#### 6.2.1 Comprendre Docker Compose

Docker Compose permet de lancer **plusieurs conteneurs** en même temps et de les faire communiquer. Ici : backend + PostgreSQL.

#### 6.2.2 Crée le fichier docker-compose

À la racine, crée **`docker-compose.yml`** :

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: saham-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: saham_bank
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgre_abdel
    ports:
      - "5433:5432"      # 5433 sur l'hôte → 5432 dans le conteneur
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: .
    container_name: saham-api
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://postgres:postgre_abdel@db:5432/saham_bank
    ports:
      - "8000:8000"
    volumes:
      - ./logs:/app/logs
      - ./.env:/app/.env

volumes:
  postgres_data:
```

**Détails importants à savoir expliquer :**

| Concept | Explication |
|---|---|
| `depends_on: db: condition: service_healthy` | L'API attend que PostgreSQL soit prêt avant de démarrer |
| `image: postgres:16-alpine` | PostgreSQL officiel, version Alpine (légère) |
| `volumes: postgres_data` | Les données persistent même si le conteneur est supprimé |
| `5433:5432` | Port externe 5433 (évite conflit si t'as déjà PG en local), interne 5432 |

#### 6.2.3 Lance tout avec une commande

```powershell
docker-compose up --build
```

- `--build` reconstruit l'image de l'API si le code a changé
- Tu vois les logs des deux conteneurs dans le même terminal
- Va sur `http://localhost:8000/docs` → API fonctionne

Pour arrêter : `Ctrl+C` puis `docker-compose down`

Pour arrêter et supprimer les données : `docker-compose down -v` (attention : vide la BDD)

---

### ÉTAPE 6.3 : Optimisation Multi-Stage Build (30 min)

Un vrai pro ne laisse pas les outils de build (gcc, libpq-dev) dans l'image finale. On utilise **multi-stage build** :

```dockerfile
# Stage 1 : Build
FROM python:3.11-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2 : Run (image légère)
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

WORKDIR /app
COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Pourquoi :** L'image finale ne contient que Python + les dépendances, pas gcc ni les headers C. Taille réduite de ~500MB à ~200MB. En production, ça compte.

---

### ÉTAPE 6.4 : .dockerignore — Ne pas envoyer le venv (5 min)

Crée **`.dockerignore`** à la racine :

```
venv/
__pycache__/
*.pyc
.env
logs/
.git/
.DS_Store
```

**Pourquoi :** Docker copie tout le dossier dans l'image. Le `venv/` fait 100MB+ inutiles puisque tu réinstalles dans le conteneur.

---

### ÉTAPE 6.5 : CI/CD avec GitHub Actions (45 min)

#### 6.5.1 Comprendre CI/CD

- **CI (Continuous Integration)** : à chaque `git push`, on lance les tests automatiquement
- **CD (Continuous Deployment)** : si les tests passent, on déploie automatiquement

#### 6.5.2 Structure GitHub Actions

Crée le dossier `.github/workflows/` et le fichier **`ci.yml`** :

```yaml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: saham_bank
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgre_abdel
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python 3.11
      uses: actions/setup-python@v5
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Run tests
      env:
        DATABASE_URL: postgresql://postgres:postgre_abdel@localhost:5432/saham_bank
      run: |
        python -m pytest tests/ -v
    
    - name: Lint check
      run: |
        pip install ruff
        ruff check app/

  build-and-push:
    needs: test-backend
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker image
      run: docker build -t saham-bank-api:latest .
    
    - name: Log in to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Push image
      run: |
        docker tag saham-bank-api:latest ${{ secrets.DOCKER_USERNAME }}/saham-bank-api:latest
        docker push ${{ secrets.DOCKER_USERNAME }}/saham-bank-api:latest
```

#### 6.5.3 Tests unitaires

Crée un dossier `tests/` à la racine et un fichier **`tests/test_api.py`** minimal :

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "version" in response.json()

def test_register():
    response = client.post("/auth/register", json={
        "email": "test@test.com",
        "nom": "Test User",
        "role": "ADMIN",
        "password": "test1234"
    })
    assert response.status_code == 200
    assert response.json()["email"] == "test@test.com"
```

---

### ÉTAPE 6.6 : Orchestration avec Airflow — Pour aller plus loin (30 min de lecture)

**Ce que c'est :** Apache Airflow est un orchestrateur de pipelines. Tu définis un **DAG** (Directed Acyclic Graph) qui dit dans quel ordre lancer les tâches, avec des retries, des alertes, un scheduling.

**Exemple de DAG pour ton pipeline ETL :**

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
from etl.etl_pipeline import ETLPipeline

default_args = {
    "owner": "saham_team",
    "retries": 2,
    "retry_delay": 5,  # minutes
}

with DAG(
    dag_id="saham_etl_pipeline",
    start_date=datetime(2026, 1, 1),
    schedule_interval="@daily",  # Tous les jours
    catchup=False,
    default_args=default_args,
) as dag:

    def run_etl():
        pipeline = ETLPipeline()
        pipeline.run(clients_count=5000, engagements_count=10000)

    run_etl_task = PythonOperator(
        task_id="run_etl_pipeline",
        python_callable=run_etl,
    )
```

**Pourquoi utiliser Airflow en entreprise :**
1. **Scheduling** : lance le pipeline tous les jours à 2h du matin
2. **Retry automatique** : si erreur, réessaie 2 fois avant d'alerter
3. **Logging centralisé** : tout est dans l'interface web d'Airflow
4. **Alertes** : Slack/Email si le pipeline échoue
5. **Backfill** : relancer le pipeline pour les jours passés

**Pour ton stage :** Airflow n'est pas obligatoire. Ton pipeline Python avec `run_pipeline.py` fait le travail. Mais si tu veux briller en entretien, dis : "J'ai conçu mon pipeline pour être compatible Airflow — chaque étape est une fonction indépendante, prête à être transformée en tâche Airflow."

---

### ÉTAPE 6.7 : Rendre le frontend accessible via le backend (15 min)

En production, on sert souvent le frontend React depuis le backend lui-même plutôt que 2 serveurs séparés. Mais pour ton stage, les laisser séparés c'est très bien — ça montre que tu comprends l'architecture microservices.

**Si tu veux les unifier pour la démo :**

Dans `app/main.py`, ajoute :

```python
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Sert le frontend React
frontend_path = Path(__file__).parent.parent.parent.parent / "saham-bank-analytics-portal"
app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")
```

**Attention :** Cette ligne doit être APRÈS les routes API, sinon `/clients/` sera cherché dans les fichiers frontend au lieu de l'API.

---

### Résumé Partie 6

| Fichier | Rôle |
|---|---|
| `Dockerfile` | Emballer l'API dans une image portable |
| `docker-compose.yml` | Lancer API + PostgreSQL d'une commande |
| `.dockerignore` | Nettoyer ce qui part dans l'image |
| `.github/workflows/ci.yml` | Tests automatiques à chaque push |
| `tests/test_api.py` | Tests unitaires pour l'API |
| `app/main.py` (modifié) | Optionnel : servir le frontend depuis l'API |

**À dire en soutenance :**
> « J'ai dockerisé l'application avec Docker Compose, ce qui permet de déployer backend et base de données d'une seule commande, avec un healthcheck qui garantit que PostgreSQL est prêt avant de démarrer l'API. J'ai aussi mis en place une CI/CD avec GitHub Actions qui exécute les tests à chaque push. Le pipeline ETL est conçu pour être orchestré par Airflow en production. »

---

## Ressources

- Guide Data Engineering : `ECRITURES/GUIDE_PEDAGOGIQUE_DATA_ENGINEERING.md`
- Cahier des charges : `ECRITURES/CAHIER_CHARGES_IMPLEMENTATION_OPEN_SOURCE.md`
- Documentation Faker : https://faker.readthedocs.io/
- Documentation SQLAlchemy : https://docs.sqlalchemy.org/
- Documentation Docker : https://docs.docker.com/
- Documentation GitHub Actions : https://docs.github.com/en/actions
- Documentation Apache Airflow : https://airflow.apache.org/docs/
