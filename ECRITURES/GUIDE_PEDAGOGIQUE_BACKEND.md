# Guide Pédagogique - Backend Saham Bank Analytics
## Pour Comprendre, Construire et Expliquer un Backend Professionnel

**Objectif :** À la fin de ce guide, tu pourras :
- Comprendre pourquoi chaque choix technique a été fait
- Construire un backend from scratch sans IA
- Expliquer l'architecture devant des experts techniques
- Faire le lien entre backend et Data Engineering

---

## Table des Matières

1. [Qu'est-ce qu'un Backend ?](#1-quest-ce-quun-backend)
2. [Pourquoi FastAPI ?](#2-pourquoi-fastapi)
3. [Pourquoi PostgreSQL ?](#3-pourquoi-postgresql)
4. [Pourquoi OAuth 2.0 + PKCE ?](#4-pourquoi-oauth-20--pkce)
5. [Pourquoi Alembic ?](#5-pourquoi-alembic)
6. [Pourquoi loguru (Structured Logging) ?](#6-pourquoi-loguru-structured-logging)
7. [Architecture en Couches](#7-architecture-en-couches)
8. [Lien Backend ↔ Data Engineering](#8-lien-backend--data-engineering)
9. [Présentation devant des Experts](#9-présentation-devant-des-experts)
10. [Étapes de Construction](#10-étapes-de-construction)

---

## 1. Qu'est-ce qu'un Backend ?

### Définition Simple

Le backend est le **"cerveau"** d'une application web qui :
- Reçoit les requêtes du frontend
- Traite les données (logique métier)
- Communique avec la base de données
- Renvoie les réponses au frontend

### Analogie du Restaurant

```
Frontend = Le serveur (interface client)
Backend = La cuisine (traitement des commandes)
Database = Le garde-manger (stockage des ingrédients)
```

**Flux :**
1. Client commande au serveur (Frontend)
2. Serveur transmet à la cuisine (Backend)
3. Cuisine vérifie le garde-manger (Database)
4. Cuisine prépare et renvoie le plat (Backend → Frontend)
5. Serveur sert le client (Frontend)

### Pourquoi ton projet a besoin d'un backend ?

**Actuel (POC) :**
- Données mockées en JavaScript dans `script_logic.js`
- Pas de persistance (données perdues au rechargement)
- Pas de vraie logique métier
- Pas de sécurité (authentification simulée)

**Cible (Production) :**
- Données persistantes en base de données
- Logique métier centralisée
- Authentification réelle avec OAuth 2.0 + PKCE (standard 2026)
- Row Level Security (RLS) PostgreSQL
- API réutilisable par d'autres applications
- Scalabilité (supporter plusieurs utilisateurs)

---

## 2. Pourquoi FastAPI ?

### Les Alternatives

| Framework | Avantages | Inconvénients | Pourquoi PAS pour ce projet |
|-----------|-----------|---------------|---------------------------|
| **Express.js (Node.js)** | JavaScript partout, rapide | Typage faible, moins structuré | Tu veux apprendre Python pour Data Engineering |
| **Django (Python)** | Batteries included, admin panel | Lourd, courbe d'apprentissage | Trop complexe pour un POC backend |
| **Flask (Python)** | Simple, flexible | Minimaliste, boilerplate | Manque de structure pour un projet pro |
| **FastAPI (Python)** | **Type safety, auto-doc, rapide** | Plus jeune que Django | **✅ Choix optimal** |

### Pourquoi FastAPI est le meilleur choix ?

#### 1. **Type Safety (Sécurité des Types)**

```python
# Avec FastAPI : les types sont vérifiés automatiquement
from pydantic import BaseModel

class Client(BaseModel):
    id: str
    nom: str
    encours: float  # Si tu envoies "abc", FastAPI rejette automatiquement
```

**Pourquoi c'est important ?**
- Évite 80% des bugs en production
- Documentation automatique
- IDE t'aide avec l'autocomplétion

#### 2. **Auto-documentation (Swagger UI)**

FastAPI génère automatiquement la documentation API :
- Ouvre `http://localhost:8000/docs`
- Tu vois tous les endpoints
- Tu peux tester directement dans le navigateur
- Pas besoin d'écrire de documentation manuelle

**Pourquoi c'est important ?**
- Les autres développeurs comprennent ton API rapidement
- Les experts techniques voient que tu es professionnel
- Gain de temps énorme

#### 3. **Performance**

FastAPI est l'un des frameworks Python les plus rapides :
- Asynchrone (peut gérer plusieurs requêtes simultanément)
- Comparable à Node.js et Go
- Idéal pour une API bancaire

#### 4. **Écosystème Python (Data Engineering)**

**C'est LE point clé pour ton objectif Data Engineer :**

FastAPI utilise Python, ce qui te permet de :
- Réutiliser tes compétences Python (pandas, numpy)
- Intégrer facilement des bibliothèques data (scikit-learn, etc.)
- Faire le pont entre backend et data engineering
- Être polyvalent (Backend + Data)

**Si tu avais choisi Express.js :**
- Tu serais fullstack JavaScript
- Plus difficile de transition vers Data Engineering
- Moins d'opportunités dans le domaine data

#### 5. **Validation Automatique**

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.post("/clients")
def create_client(client: Client):
    # FastAPI valide automatiquement :
    # - Les types (str, int, float)
    # - Les champs requis
    # - Les formats (email, URL)
    # Si erreur : 422 Unprocessable Entity
    return {"message": "Client créé"}
```

**Sans FastAPI (Express.js) :**
```javascript
// Tu dois écrire manuellement toute la validation
if (!client.nom || typeof client.nom !== 'string') {
    return res.status(400).json({error: "Nom invalide"});
}
if (!client.encours || typeof client.encours !== 'number') {
    return res.status(400).json({error: "Encours invalide"});
}
// ... et ainsi de suite pour chaque champ
```

### Résumé : Pourquoi FastAPI ?

✅ **Type safety** → Moins de bugs  
✅ **Auto-documentation** → Professionnel  
✅ **Performance** → Scalable  
✅ **Python** → Data Engineering  
✅ **Validation automatique** → Gain de temps  

---

## 3. Pourquoi PostgreSQL ?

### Les Alternatives

| Database | Avantages | Inconvénients | Pourquoi PAS |
|----------|-----------|---------------|-------------|
| **MySQL** | Populaire, simple | Moins de fonctionnalités avancées | PostgreSQL est plus puissant |
| **MongoDB** | Flexible, NoSQL | Pas relationnel, schéma dynamique | Besoin de données structurées bancaires |
| **SQLite** | Simple, fichier unique | Pas scalable, un seul utilisateur | Pour un vrai projet, pas adapté |
| **PostgreSQL** | **Puissant, relationnel, extensible** | Plus complexe que SQLite | **✅ Choix optimal** |

### Pourquoi PostgreSQL est le meilleur choix ?

#### 1. **Relationnel (ACID)**

Les données bancaires nécessitent :
- **Atomicité** : Une transaction soit réussit soit échoue (pas de demi-opération)
- **Consistance** : Les données restent valides
- **Isolation** : Les transactions ne s'interfèrent pas
- **Durabilité** : Les données sont sauvegardées même en cas de crash

**Exemple bancaire :**
```sql
BEGIN TRANSACTION;
UPDATE comptes SET solde = solde - 1000 WHERE id = 1;
UPDATE comptes SET solde = solde + 1000 WHERE id = 2;
COMMIT;
-- Si erreur entre les deux UPDATE, tout est annulé (ROLLBACK)
```

#### 2. **Types de données riches**

PostgreSQL supporte des types avancés :
- `JSON/JSONB` : Pour des données flexibles
- `ARRAY` : Pour des listes
- `UUID` : Identifiants uniques
- `GEOMETRY` : Données géographiques (utile pour les agences)

#### 3. **Extensibilité (pgvector)**

**C'est crucial pour l'IA :**

PostgreSQL peut être étendu avec des extensions :
- **pgvector** : Pour la recherche de similarité vectorielle (IA, RAG)
- **PostGIS** : Pour les données géographiques
- **TimescaleDB** : Pour les séries temporelles

**Pourquoi pgvector ?**
- Le chatbot de l'autre équipe utilise probablement des embeddings
- Tu pourras stocker et rechercher des vecteurs dans PostgreSQL
- C'est une compétence très demandée en Data Engineering

#### 4. **Standard industrie**

PostgreSQL est utilisé par :
- Apple
- Instagram
- Spotify
- Netflix

**Pourquoi c'est important pour toi ?**
- Compétence recherchée par les entreprises
- Communauté active
- Beaucoup de ressources en ligne

### Résumé : Pourquoi PostgreSQL ?

✅ **ACID** → Fiabilité bancaire  
✅ **Types riches** → Flexibilité  
✅ **Extensible (pgvector)** → IA/ML  
✅ **Standard industrie** → Employabilité  
✅ **RLS natif** → Sécurité au niveau ligne  

---

## 4. Pourquoi OAuth 2.0 + PKCE ?

### Pourquoi PAS JWT ?

**JWT (JSON Web Tokens) était standard en 2020-2023, mais en 2026 :**

| Critère | JWT | OAuth 2.0 + PKCE |
|---------|-----|------------------|
| **Standard** | Obsolète pour authentification moderne | Standard 2026 |
| **Sécurité** | Tokens stockés en localStorage (vulnérable) | Tokens courts-lived, refresh tokens |
| **Mobile** | Difficile à sécuriser sur mobile | PKCE optimisé pour mobile |
| **Compliance** | Moins conforme RGPD | Conforme OWASP Top 10 |
| **Industry** | Déclinant | Adopté par Google, Microsoft, etc. |

### Pourquoi OAuth 2.0 + PKCE est le standard 2026 ?

#### 1. **Sécurité accrue**

**Problème JWT :**
```javascript
// ❌ JWT stocké en localStorage (vulnérable XSS)
localStorage.setItem('token', jwt_token);
// Si XSS attack, le token est volé
```

**Solution OAuth 2.0 + PKCE :**
```python
# ✅ Tokens courts-lived + refresh token
access_token = "short_lived_token_15min"  # Expiré rapidement
refresh_token = "secure_long_lived"      # Stocké en httpOnly cookie
# Même si access_token volé, expire en 15 min
```

#### 2. **PKCE (Proof Key for Code Exchange)**

**PKCE protège contre l'interception du code d'autorisation :**

```
1. Client génère code_verifier (random string)
2. Client génère code_challenge = hash(code_verifier)
3. Client envoie code_challenge au serveur
4. Serveur renvoie authorization_code
5. Client envoie authorization_code + code_verifier
6. Serveur vérifie hash(code_verifier) == code_challenge
```

**Pourquoi c'est important ?**
- Protège contre les attaques d'interception
- Standard pour les applications mobiles et SPAs
- Recommandé par OAuth 2.1 Security Best Practices

#### 3. **Refresh Tokens**

```python
# Access token : Court-lived (15 min)
# Refresh token : Long-lived (30 jours)
# Si access_token expiré, utiliser refresh_token pour en obtenir un nouveau
```

**Avantages :**
- Moins de demandes d'authentification
- Meilleure UX (pas de re-login fréquent)
- Sécurité (refresh_token peut être révoqué)

#### 4. **Row Level Security (RLS)**

OAuth 2.0 + PKCE s'intègre parfaitement avec RLS PostgreSQL :

```sql
-- Politique RLS : Un DR ne voit que les clients de sa région
CREATE POLICY dr_region_policy ON clients
    FOR SELECT
    USING (region = current_setting('app.user_region'));

-- Application de la politique depuis OAuth 2.0
SET app.user_region = 'Casablanca-Settat';
```

### Résumé : Pourquoi OAuth 2.0 + PKCE ?

✅ **Standard 2026** → Moderne, conforme  
✅ **Sécurité accrue** → Tokens courts-lived  
✅ **PKCE** → Protection contre interception  
✅ **Refresh tokens** → Meilleure UX  
✅ **RLS intégré** → Sécurité au niveau ligne  

---

## 5. Pourquoi Alembic ?

### Pourquoi PAS de migrations manuelles ?

**Sans Alembic :**
```sql
-- ❌ Migrations manuelles (danger)
-- Tu dois exécuter manuellement chaque script SQL
-- Pas de versioning
-- Pas de rollback
-- Difficile en équipe
```

**Avec Alembic :**
```python
# ✅ Migrations versionnées
alembic revision --autogenerate -m "Add clients table"
alembic upgrade head
alembic downgrade -1  # Rollback facile
```

### Pourquoi Alembic est essentiel ?

#### 1. **Versioning**

Chaque changement de schéma = nouvelle migration :
```
versions/
├── 001_initial_schema.py
├── 002_add_clients_table.py
├── 003_add_engagements_table.py
└── 004_add_rls_policies.py
```

#### 2. **Rollback**

Si une migration casse la production :
```bash
alembic downgrade -1  # Revenir à la version précédente
```

#### 3. **Team collaboration**

Chaque développeur peut :
- Voir l'historique des migrations
- Appliquer les migrations automatiquement
- Éviter les conflits de schéma

#### 4. **SQLAlchemy intégré**

Alembic fonctionne parfaitement avec SQLAlchemy :
```python
# Migration générée automatiquement depuis les modèles SQLAlchemy
alembic revision --autogenerate -m "Add clients table"
```

### Résumé : Pourquoi Alembic ?

✅ **Versioning** → Historique complet  
✅ **Rollback** → Sécurité en production  
✅ **Team collaboration** → Pas de conflits  
✅ **SQLAlchemy intégré** → Automatisation  

---

## 6. Pourquoi loguru (Structured Logging) ?

### Pourquoi PAS print() ?

**Sans loguru :**
```python
# ❌ print() (pas professionnel)
print("Client créé")  # Pas de contexte
print(f"Erreur: {error}")  # Pas de niveau de sévérité
# Pas de rotation de logs
# Pas de format structuré
```

**Avec loguru :**
```python
# ✅ loguru (structured logging)
logger.info("Client créé", client_id=123, nom="Test")
logger.error("Erreur création", error=str(e), client_id=123)
# Logs structurés (JSON)
# Rotation automatique
# Niveaux de sévérité
```

### Pourquoi loguru est essentiel ?

#### 1. **Structured Logging**

```json
{
  "timestamp": "2026-07-15T10:30:00",
  "level": "INFO",
  "message": "Client créé",
  "client_id": 123,
  "nom": "Test",
  "user_id": 456
}
```

**Avantages :**
- Parseable par des outils (ELK, Grafana)
- Recherche facile
- Contexte complet

#### 2. **Rotation automatique**

```python
logger.add("app.log", rotation="500 MB", retention="10 days")
# Rotation quand fichier > 500 MB
# Suppression après 10 jours
```

#### 3. **Niveaux de sévérité**

```python
logger.debug("Détail technique")
logger.info("Information")
logger.warning("Avertissement")
logger.error("Erreur")
logger.critical("Critique")
```

### Résumé : Pourquoi loguru ?

✅ **Structured logging** → Parseable  
✅ **Rotation automatique** → Gestion facile  
✅ **Niveaux de sévérité** → Priorisation  
✅ **Contexte complet** → Debug facile  

---

## 7. Architecture en Couches

### Pourquoi une architecture en couches ?

Sans architecture, tout est mélangé :
```python
# ❌ MAUVAIS : Tout mélangé
@app.get("/clients")
def get_clients():
    # Requête SQL
    db = create_connection()
    clients = db.execute("SELECT * FROM clients")
    
    # Logique métier
    filtered = [c for c in clients if c.score > 50]
    
    # Validation
    if not filtered:
        raise HTTPException(404)
    
    # Formatage
    return [{"id": c.id, "nom": c.nom} for c in filtered]
```

**Problèmes :**
- Difficile à tester
- Difficile à maintenir
- Code spaghetti
- Impossible de réutiliser

### Architecture en Couches (CLEAN ARCHITECTURE)

```
┌─────────────────────────────────────┐
│         Frontend (React)             │
│    http://localhost:3000             │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│         API Layer (Routers)          │
│  - Définit les endpoints             │
│  - Valide les requêtes               │
│  - Appelle les services              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Business Logic (Services)       │
│  - Logique métier                    │
│  - Règles de validation              │
│  - Transformation de données         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Data Access (Models/ORM)        │
│  - Communication avec DB             │
│  - Mapping objet-relationnel         │
│  - Requêtes SQL                     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         PostgreSQL Database          │
│   (users, clients, engagements)      │
└─────────────────────────────────────┘
```

### Pourquoi cette architecture ?

#### 1. **Séparation des responsabilités**

Chaque couche a un rôle précis :
- **Routers** : "QUOI" faire (endpoint)
- **Services** : "COMMENT" faire (logique)
- **Models** : "OÙ" trouver les données (DB)

#### 2. **Testabilité**

Tu peux tester chaque couche indépendamment :
```python
# Test du service sans base de données
def test_client_service():
    service = ClientService()
    result = service.filter_by_score([mock_client], 50)
    assert result == [expected_client]
```

#### 3. **Maintenabilité**

Si tu changes la base de données :
- Seuls les Models changent
- Services et Routers restent identiques

#### 4. **Réutilisabilité**

Un service peut être appelé par plusieurs routers :
```python
# Le même service utilisé par l'API et par un script batch
client_service = ClientService()
# API
@app.get("/clients")
def get_api_clients():
    return client_service.get_all()
# Batch
def nightly_batch():
    return client_service.export_csv()
```

### Exemple Concret

```python
# ✅ BON : Architecture en couches

# 1. Model (Data Access)
class ClientModel(Base):
    __tablename__ = "clients"
    id = Column(String, primary_key=True)
    nom = Column(String)
    score = Column(Integer)

# 2. Service (Business Logic)
class ClientService:
    def filter_by_score(self, min_score: int):
        clients = self.db.query(ClientModel).all()
        return [c for c in clients if c.score >= min_score]

# 3. Router (API Layer)
@app.get("/clients")
def get_clients(min_score: int = 50):
    service = ClientService()
    clients = service.filter_by_score(min_score)
    return clients
```

---

## 8. Lien Backend ↔ Data Engineering

### Tu ne deviens pas Fullstack, tu deviens un Data Engineer Complet

#### Fullstack Engineer vs Data Engineer

| Compétence | Fullstack | Data Engineer | Toi (Backend + Data) |
|-----------|-----------|---------------|---------------------|
| Frontend (React) | ✅ Expert | ❌ Non | ❌ Non (une autre équipe s'en occupe) |
| Backend (API) | ✅ Expert | ⚠️ Parfois | ✅ **Oui (ce projet)** |
| ETL/ELT | ❌ Non | ✅ Expert | ⚠️ À apprendre |
| Data Warehousing | ❌ Non | ✅ Expert | ⚠️ À apprendre |
| Python (pandas, numpy) | ⚠️ Parfois | ✅ Expert | ✅ **Oui (ce projet)** |
| SQL | ⚠️ Parfois | ✅ Expert | ✅ **Oui (ce projet)** |
| Cloud (AWS/GCP/Azure) | ⚠️ Parfois | ✅ Expert | ⚠️ À apprendre |

### Pourquoi ce backend t'aide à devenir Data Engineer ?

#### 1. **Compréhension des données**

En créant le backend, tu comprends :
- Comment les données sont structurées (schéma PostgreSQL)
- Comment les données circulent (API)
- Comment les données sont validées (Pydantic)
- Comment les données sont persistées (SQLAlchemy)

**C'est la base du Data Engineering :**
- Si tu ne comprends pas comment les données sont produites, tu ne peux pas les ingérer.

#### 2. **SQL Avancé**

PostgreSQL t'apprend :
- Requêtes complexes (JOIN, GROUP BY, WINDOW functions)
- Indexation et performance
- Transactions et ACID
- Extensions (pgvector)

**Ces compétences sont directement transférables en Data Engineering.**

#### 3. **Python pour la Data**

FastAPI utilise Python, ce qui te permet de :
- Utiliser pandas pour manipuler les données
- Utiliser scikit-learn pour le ML
- Créer des scripts ETL en Python
- Automatiser des tâches data

#### 4. **API pour Data Pipelines**

Un backend est une API, et les Data Pipelines consomment des APIs :
```python
# Data Pipeline qui consomme ton backend API
import requests

response = requests.get("http://backend/api/clients")
data = response.json()
df = pd.DataFrame(data)
# Traitement data...
```

#### 5. **Compréhension de l'architecture système**

Un Data Engineer doit comprendre :
- Comment les applications produisent des données
- Comment les données sont stockées
- Comment les données sont exposées

**Ce backend te donne cette compréhension.**

### Parcours recommandé pour Data Engineer

```
Étape actuelle : Backend FastAPI (ce projet)
    ↓
Étape suivante : ETL/ELT (Airflow, dbt)
    ↓
Étape suivante : Data Warehousing (Snowflake, BigQuery)
    ↓
Étape suivante : Data Engineering avancé (Streaming, Real-time)
```

**Ce projet est la première étape, pas une distraction.**

---

## 9. Présentation devant des Experts

### Comment structurer ta présentation ?

#### 1. **Introduction (2 min)**

```
"Bonjour, je vais présenter l'architecture backend du portail 
analytique Saham Bank. L'objectif est de remplacer les données 
mockées par une API robuste et scalable."
```

#### 2. **Pourquoi ces choix techniques ? (5 min)**

**FastAPI :**
- "J'ai choisi FastAPI pour sa type safety et sa performance"
- "L'auto-documentation Swagger facilite l'intégration"
- "Python me permet de réutiliser mes compétences data"

**PostgreSQL :**
- "PostgreSQL pour sa fiabilité ACID, critique pour les données bancaires"
- "L'extension pgvector permettra l'intégration IA future"
- "Standard industrie, largement adopté"

#### 3. **Architecture (5 min)**

```
"J'ai adopté une architecture en couches :
- Routers : Définition des endpoints API
- Services : Logique métier
- Models : Accès aux données

Cette approche assure :
- Séparation des responsabilités
- Testabilité
- Maintenabilité"
```

#### 4. **Flux de données (3 min)**

```
"Le flux de données est :
1. Frontend envoie une requête HTTP
2. Router valide et route vers le service
3. Service applique la logique métier
4. Model interroge PostgreSQL
5. Données retournées au frontend"
```

#### 5. **Sécurité (2 min)**

```
"Pour la sécurité :
- Authentification OAuth 2.0 + PKCE (standard 2026)
- Row Level Security (RLS) PostgreSQL
- Hashage des mots de passe (bcrypt)
- Validation des entrées (Pydantic)
- CORS configuré pour le frontend"
```

#### 6. **Scalabilité (2 min)**

```
"L'architecture est scalable :
- FastAPI asynchrone gère plusieurs requêtes
- PostgreSQL supporte des millions de lignes
- Séparation frontend/backend permet scaling indépendant"
```

#### 7. **Intégration Chatbot (1 min)**

```
"Pour l'intégration du chatbot :
- L'équipe IA consommera nos endpoints
- Les données clients et engagements seront accessibles via API
- L'extension pgvector permettra la recherche sémantique"
```

#### 8. **Conclusion (1 min)**

```
"En résumé, ce backend :
- Remplace les données mockées par une solution robuste
- Utilise des technologies modernes et standards
- Est prêt pour l'intégration IA et le scaling
- Me permet de développer des compétences Data Engineering"
```

### Questions fréquentes des experts et réponses

**Q : Pourquoi pas Express.js ?**
R : "J'ai choisi FastAPI pour me concentrer sur Python, qui est le langage standard en Data Engineering. Cela me permet de développer des compétences transférables."

**Q : Comment tu gères la concurrence ?**
R : "FastAPI est asynchrone et utilise async/await, ce qui permet de gérer plusieurs requêtes simultanément efficacement."

**Q : Comment tu assures la qualité des données ?**
R : "Validation à plusieurs niveaux : Pydantic pour les entrées API, contraintes PostgreSQL pour la base de données, et services pour la logique métier."

**Q : Comment tu testes ?**
R : "Tests unitaires pour les services, tests d'intégration pour les routers, et tests end-to-end pour les flux complets."

---

## 10. Étapes de Construction

### Étape 1 : Setup (0.5j) ✅ TERMINÉ

**Objectif :** Préparer l'environnement

**Ce que tu as fait :**
- Créé le dossier `saham-bank-backend/`
- Setup environnement virtuel Python
- Installé les dépendances (FastAPI, SQLAlchemy, etc.)
- Créé la structure de dossiers

**Pourquoi c'est important :**
- Environnement isolé → Pas de conflits de versions
- Structure organisée → Code maintenable

---

### Étape 2 : Database Schema (1j)

**Objectif :** Définir les tables PostgreSQL

**Concepts à comprendre :**
- **Modèle relationnel** : Tables avec relations (1:N, N:M)
- **Clés primaires** : Identifiant unique (id)
- **Clés étrangères** : Lien entre tables
- **Types de données** : VARCHAR, INTEGER, FLOAT, DATE

**Tables à créer :**
1. `users` : Utilisateurs avec rôles (DG, DR, CA, AR, Admin)
2. `clients` : Clients bancaires
3. `engagements` : Dossiers de crédit
4. `agences` : Agences bancaires

**Pourquoi ces tables ?**
- `users` : Authentification et autorisation
- `clients` : Données principales du métier
- `engagements` : Dossiers liés aux clients
- `agences` : Géographie et organisation

**Outils :**
- SQLAlchemy (ORM Python)
- Alembic (Migrations)

---

### Étape 3 : Setup FastAPI Base (0.5j)

**Objectif :** Créer l'application FastAPI

**Concepts à comprendre :**
- **Application FastAPI** : Point d'entrée
- **CORS** : Autoriser les requêtes du frontend
- **Dependency Injection** : Injecter la session DB

**Fichiers à créer :**
- `app/main.py` : Application principale
- `app/config.py` : Configuration (variables d'environnement)
- `app/database.py` : Connection PostgreSQL

**Pourquoi ?**
- `main.py` : Définit l'application et enregistre les routers
- `config.py` : Sépare configuration du code (best practice)
- `database.py` : Centralise la gestion de la DB

---

### Étape 4 : API Authentication (1j)

**Objectif :** Sécuriser l'API

**Concepts à comprendre :**
- **JWT (JSON Web Token)** : Token d'authentification
- **Hashage** : Stocker les mots de passe de manière sécurisée
- **OAuth2** : Standard d'authentification

**Endpoints à créer :**
- `POST /api/auth/login` : Connexion
- `POST /api/auth/logout` : Déconnexion
- `GET /api/auth/me` : Profil utilisateur

**Pourquoi JWT ?**
- Stateless : Pas besoin de stocker les sessions en DB
- Scalable : Facile à distribuer
- Standard : Utilisé par Google, Facebook, etc.

---

### Étape 5 : API Clients & Dashboard (1j)

**Objectif :** Exposer les données métier

**Concepts à comprendre :**
- **CRUD** : Create, Read, Update, Delete
- **Pagination** : Limiter le nombre de résultats
- **Filtrage** : Rechercher avec critères

**Endpoints à créer :**
- `GET /api/clients` : Liste des clients
- `GET /api/clients/{id}` : Détail client
- `GET /api/dashboard/kpis` : KPIs principaux
- `GET /api/dashboard/segments` : Distribution par segment

**Pourquoi ?**
- Le frontend a besoin de ces données
- Les endpoints doivent être optimisés (pagination, filtrage)

---

### Étape 6 : Génération Données Faker (1j)

**Objectif :** Peupler la base avec des données réalistes

**Concepts à comprendre :**
- **Seed data** : Données initiales
- **Faker** : Bibliothèque de génération de données
- **Corrélation** : Données cohérentes entre elles

**Scripts à créer :**
- `seed_users.py` : Utilisateurs par défaut
- `seed_clients.py` : Clients avec données bancaires réalistes
- `seed_engagements.py` : Dossiers de crédit

**Pourquoi des données réalistes ?**
- Tester l'application avec des données proches de la réalité
- Démontrer les fonctionnalités aux stakeholders
- Préparer pour les données réelles futures

---

### Étape 7 : Intégration Frontend (0.5j)

**Objectif :** Connecter le frontend React au backend

**Concepts à comprendre :**
- **HTTP Client** : fetch/axios
- **Async/Await** : Requêtes asynchrones
- **Error handling** : Gestion des erreurs

**Modifications :**
- Remacer les données mockées par des appels API
- Gérer les tokens JWT
- Gérer les erreurs HTTP

**Pourquoi ?**
- Le frontend doit consommer l'API
- L'expérience utilisateur doit être fluide

---

## Résumé des Concepts Clés

### Backend
- API : Interface entre frontend et backend
- REST : Standard d'architecture API
- HTTP : Protocole de communication

### FastAPI
- Type safety : Validation automatique des types
- Async/await : Gestion asynchrone
- Dependency injection : Injection de dépendances

### PostgreSQL
- Relationnel : Tables avec relations
- ACID : Propriétés transactionnelles
- SQL : Langage de requête

### Architecture
- Couches : Séparation des responsabilités
- ORM : Mapping objet-relationnel
- Services : Logique métier

### Sécurité
- JWT : Token d'authentification
- Hashage : Sécurisation des mots de passe
- CORS : Contrôle d'accès cross-origin

---

## Prochaines Étapes

1. ✅ Setup (terminé)
2. ⏳ Database Schema (à faire)
3. ⏳ Setup FastAPI Base
4. ⏳ API Authentication
5. ⏳ API Clients & Dashboard
6. ⏳ Génération Données Faker
7. ⏳ Intégration Frontend

---

## Ressources d'Apprentissage

### FastAPI
- Documentation officielle : https://fastapi.tiangolo.com/
- Tutoriel officiel : https://fastapi.tiangolo.com/tutorial/

### PostgreSQL
- Documentation officielle : https://www.postgresql.org/docs/
- Tutorial W3Schools : https://www.w3schools.com/postgresql/

### SQLAlchemy
- Documentation : https://docs.sqlalchemy.org/

### Data Engineering
- "Fundamentals of Data Engineering" (livre)
- "Designing Data-Intensive Applications" (livre)

---

## Conclusion

Ce backend n'est pas une distraction de ton objectif Data Engineer, c'est **la fondation**.

En comprenant comment les données sont produites, stockées et exposées, tu seras un meilleur Data Engineer.

Les compétences que tu développes ici (Python, SQL, Architecture) sont directement transférables en Data Engineering.

**Tu n'es pas en train de devenir Fullstack, tu es en train de devenir un Data Engineer qui comprend comment les applications fonctionnent.**
