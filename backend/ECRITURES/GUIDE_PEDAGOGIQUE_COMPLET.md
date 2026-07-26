# Guide Pédagogique Complet - Saham Bank Backend

## Objectif : Apprendre en faisant

Ce guide t'accompagne étape par étape pour construire l'entièreté du backend Saham Bank :
- FastAPI (API REST)
- SQLAlchemy (ORM)
- OAuth 2.0 + PKCE (Authentification)
- PostgreSQL (Base de données)
- Medallion Architecture (Data Engineering)
- Faker (Génération de données)
- ETL Pipelines (Bronze → Silver → Gold)

**IMPORTANT : Tu vas faire le travail toi-même. Ce guide donne des EXEMPLES pour la première table/entité, et tu feras le reste en suivant le pattern.**

**Fichiers TODO déjà créés :**
- Tous les squelettes avec TODO détaillés sont déjà dans les dossiers
- Tu peux les consulter pour voir la structure complète

---

## Étape 1 : Installation et Configuration (30 minutes)

### 1.1 Vérifier Python

**Ouvre un terminal dans `c:\Users\user\Downloads\saham-bank-backend` :**
```bash
python --version
```

**Si Python n'est pas installé :**
- Télécharge Python 3.10+ depuis https://www.python.org/downloads/
- Installe en cochant "Add Python to PATH"

### 1.2 Créer l'environnement virtuel

**Dans le terminal :**
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Si erreur d'exécution de scripts :**
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 1.3 Installer les dépendances

**Créer un fichier `requirements.txt` dans saham-bank-backend :**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
loguru==0.7.2
faker==20.1.0
alembic==1.13.0
python-dotenv==1.0.0
```

**Installer :**
```bash
pip install -r requirements.txt
```

### 1.4 Configurer PostgreSQL

**Tu as déjà PostgreSQL et pgAdmin. Crée la base de données :**

1. Ouvre pgAdmin
2. Clic droit sur Databases → Create → Database
3. Nom : `saham_bank`
4. Owner : `postgres`

### 1.5 Configurer les variables d'environnement

**Créer un fichier `.env` dans saham-bank-backend :**
```env
# Database
DATABASE_URL=postgresql://postgres:TON_MOT_DE_PASSE@localhost:5432/saham_bank
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=saham_bank
POSTGRES_USER=postgres
POSTGRES_PASSWORD=TON_MOT_DE_PASSE

# OAuth 2.0 + PKCE
SECRET_KEY=ta_cle_secrete_aleatoire_tres_longue_et_complexe
OAUTH_CLIENT_ID=client_id
OAUTH_CLIENT_SECRET=client_secret
OAUTH_REDIRECT_URI=http://localhost:3000/callback

# Logging
LOG_LEVEL=INFO
LOG_FILE=app.log

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

**IMPORTANT : Remplace TON_MOT_DE_PASSE par ton mot de passe PostgreSQL**

---

## Étape 2 : Configuration de l'application (30 minutes)

### 2.1 Comprendre la configuration

**Ouvre `app/config.py` (squelette déjà créé avec TODO). Implémente-le en suivant le pattern :**

**EXEMPLE pour la configuration :**
```python
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    POSTGRES_HOST: str = Field("localhost", env="POSTGRES_HOST")
    # ... autres champs
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

**POURQUOI cette configuration ?**
- Centralise toutes les variables d'environnement
- Pydantic valide automatiquement les types
- Facile à tester (mock de settings)
- Facile à déployer (variables d'environnement)

**À toi de faire :** Implémente le reste en suivant le squelette TODO dans `app/config.py`

---

## Étape 3 : Configuration de la base de données (30 minutes)

### 3.1 Comprendre SQLAlchemy

**Ouvre `app/database.py` (squelette déjà créé avec TODO). Implémente-le en suivant le pattern :**

**EXEMPLE pour la configuration :**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
```

**POURQUOI cette configuration ?**
- `pool_pre_ping` : Évite les connexions mortes
- `autocommit=False` : Transactions explicites
- `get_db()` : Dependency injection FastAPI

**À toi de faire :** Implémente le reste en suivant le squelette TODO dans `app/database.py`

---

## Étape 4 : Modèles SQLAlchemy (1 heure)

### 4.1 Comprendre les modèles

**Les modèles SQLAlchemy définissent la structure des tables.**

### 4.2 Modèle User (EXEMPLE COMPLET)

**Ouvre `app/models/user.py` (squelette déjà créé avec TODO). Voici l'exemple complet :**

```python
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(enum.Enum):
    DG = "DG"
    DR = "DR"
    CA = "CA"
    AR = "AR"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    nom = Column(String(100), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**POURQUOI ce modèle ?**
- `index=True` : Index pour optimiser les recherches
- `unique=True` : Un seul utilisateur par email
- `Enum` : Seuls les rôles autorisés

### 4.3 Modèle Agence (À TOI DE FAIRE)

**Ouvre `app/models/agence.py` (squelette déjà créé avec TODO). Implémente-le en suivant le pattern du modèle User :**

**Pattern à suivre :**
- Hériter de `Base`
- Définir `__tablename__`
- Définir les colonnes avec `Column`
- Utiliser les types appropriés (String, Integer, Float, etc.)
- Ajouter `created_at` et `updated_at`

**À toi de faire :** Implémente `app/models/agence.py`, `app/models/client.py`, `app/models/engagement.py` en suivant le pattern

---

## Étape 5 : Schemas Pydantic (30 minutes)

### 5.1 Comprendre les schemas

**Les schemas Pydantic valident les données API.**

### 5.2 Schema User (EXEMPLE COMPLET)

**Ouvre `app/schemas/user.py` (squelette déjà créé avec TODO). Voici l'exemple complet :**

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    nom: str = Field(..., min_length=1, max_length=100)
    role: UserRole


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nom: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
```

**POURQUOI ces schemas ?**
- `Base` : Champs communs
- `Create` : Pour la création
- `Response` : Pour la réponse API
- `Update` : Pour la mise à jour (tous optionnels)

### 5.3 Schemas Agence, Client, Engagement (À TOI DE FAIRE)

**Ouvre les fichiers squelettes et implémente-les en suivant le pattern du schema User :**

**Pattern à suivre :**
- `XxxBase` : Champs communs
- `XxxCreate` : Hérite de Base + champs création
- `XxxResponse` : Hérite de Base + tous les champs
- `XxxUpdate` : Tous les champs optionnels

**À toi de faire :** Implémente `app/schemas/agence.py`, `app/schemas/client.py`, `app/schemas/engagement.py`

---

## Étape 6 : Sécurité OAuth 2.0 + PKCE (1 heure)

### 6.1 Comprendre OAuth 2.0 + PKCE

**OAuth 2.0 + PKCE est le standard 2026 pour l'authentification.**

### 6.2 Implémenter la sécurité

**Ouvre `app/core/security.py` (squelette déjà créé avec TODO). Implémente-le en suivant le pattern :**

**EXEMPLE pour hashage :**
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**EXEMPLE pour PKCE :**
```python
import hashlib
import base64
import secrets

def generate_code_verifier() -> str:
    return secrets.token_urlsafe(32)

def generate_code_challenge(code_verifier: str) -> str:
    hash_bytes = hashlib.sha256(code_verifier.encode()).digest()
    return base64.urlsafe_b64encode(hash_bytes).decode().rstrip("=")
```

**EXEMPLE pour JWT :**
```python
from jose import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
```

**À toi de faire :** Implémente le reste en suivant le squelette TODO dans `app/core/security.py`

---

## Étape 7 : Routers FastAPI (1 heure)

### 7.1 Comprendre les routers

**Les routers définissent les endpoints API.**

### 7.2 Router Agences (EXEMPLE COMPLET)

**Ouvre `app/routers/agences.py` (squelette déjà créé avec TODO). Voici l'exemple complet :**

```python
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.agence import Agence
from app.schemas.agence import AgenceCreate, AgenceResponse

router = APIRouter()

@router.get("/", response_model=List[AgenceResponse])
async def list_agences(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Agence)
    agences = query.offset(skip).limit(limit).all()
    return agences

@router.get("/{agence_id}", response_model=AgenceResponse)
async def get_agence(agence_id: str, db: Session = Depends(get_db)):
    agence = db.query(Agence).filter(Agence.id == agence_id).first()
    if not agence:
        raise HTTPException(status_code=404, detail="Agence non trouvée")
    return agence

@router.post("/", response_model=AgenceResponse)
async def create_agence(agence: AgenceCreate, db: Session = Depends(get_db)):
    db_agence = Agence(**agence.dict())
    db.add(db_agence)
    db.commit()
    db.refresh(db_agence)
    return db_agence
```

**POURQUOI ce router ?**
- `@router.get` : Endpoint GET
- `response_model` : Validation de la réponse
- `Depends(get_db)` : Injection de la session DB
- `db.query` : Requête SQLAlchemy

### 7.3 Routers Clients et Engagements (À TOI DE FAIRE)

**Ouvre les fichiers squelettes et implémente-les en suivant le pattern du router Agences :**

**Pattern à suivre :**
- `GET /` : Lister avec filtres
- `GET /{id}` : Obtenir par ID
- `POST /` : Créer
- `PUT /{id}` : Mettre à jour
- `DELETE /{id}` : Supprimer

**À toi de faire :** Implémente `app/routers/clients.py`, `app/routers/engagements.py`

---

## Étape 8 : Application FastAPI (30 minutes)

### 8.1 Comprendre main.py

**main.py est le point d'entrée de l'application.**

### 8.2 Implémenter main.py

**Ouvre `app/main.py` (squelette déjà créé avec TODO). Implémente-le en suivant le pattern :**

**EXEMPLE pour la configuration :**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import agences, clients, engagements

app = FastAPI(title="Saham Bank API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agences.router, prefix="/agences", tags=["Agences"])
app.include_router(clients.router, prefix="/clients", tags=["Clients"])
app.include_router(engagements.router, prefix="/engagements", tags=["Engagements"])

@app.get("/")
async def root():
    return {"message": "Saham Bank API", "version": "1.0.0"}
```

**À toi de faire :** Implémente le reste en suivant le squelette TODO dans `app/main.py`

---

## Étape 9 : Faker pour Saham Bank (1 heure)

### 9.1 Comprendre Faker

**Faker génère des données factices mais réalistes.**

### 9.2 Implémenter le provider

**Ouvre `etl/providers/moroccan_provider.py` (squelette déjà créé avec TODO). Implémente-le en suivant le pattern :**

**EXEMPLE pour une méthode :**
```python
from faker import Faker
from faker.providers import BaseProvider
import random

class MoroccanBankingProvider(BaseProvider):
    AGENCES = ["Casablanca Anfa", "Casablanca Maarif", ...]
    
    def agence(self):
        return random.choice(self.AGENCES)
```

**À toi de faire :** Implémente toutes les méthodes en suivant le squelette TODO

---

## Étape 10 : ETL Bronze (1 heure)

### 10.1 Comprendre Bronze

**Bronze = Données brutes depuis Faker.**

### 10.2 Extract Bronze - Users (EXEMPLE COMPLET)

**Ouvre `etl/bronze/extract_bronze.py` (squelette déjà créé avec TODO). Voici l'exemple pour users :**

```python
from faker import Faker
from etl.providers.moroccan_provider import MoroccanBankingProvider
from typing import List, Dict, Any
from datetime import datetime

class BronzeExtractor:
    def __init__(self):
        self.fake = Faker()
        self.fake.add_provider(MoroccanBankingProvider)
    
    def generate_users(self, count: int = 10) -> List[Dict[str, Any]]:
        users = []
        for i in range(count):
            user = {
                "id": f"USR-{i+1:05d}",
                "email": f"user{i+1}@sahambank.ma",
                "nom": self.fake.nom_complet_marocain(),
                "role": random.choice(["DG", "DR", "CA", "AR", "ADMIN"]),
                "is_active": True,
                "created_at": datetime.now()
            }
            users.append(user)
        return users
```

**POURQUOI cette méthode ?**
- Génération de données brutes
- Format dict pour faciliter l'insertion
- ID formaté (USR-00001)

### 10.3 Extract Bronze - Agences, Clients, Engagements (À TOI DE FAIRE)

**Implémente les autres méthodes en suivant le pattern de `generate_users` :**

**Pattern à suivre :**
- Boucle `for i in range(count)`
- Créer un dict avec les champs
- Utiliser `self.fake` pour générer les données
- Retourner la liste

**À toi de faire :** Implémente `generate_agences`, `generate_clients`, `generate_engagements`

### 10.4 Load Bronze - Users (EXEMPLE COMPLET)

**Ouvre `etl/bronze/load_bronze.py` (squelette déjà créé avec TODO). Voici l'exemple pour users :**

```python
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from typing import List, Dict, Any
from app.config import settings

class BronzeLoader:
    def __init__(self):
        self.engine = create_engine(settings.DATABASE_URL)
        self.SessionLocal = sessionmaker(bind=self.engine)
    
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
    
    def load_users(self, users: List[Dict[str, Any]]) -> int:
        session = self.SessionLocal()
        try:
            for user in users:
                session.execute(
                    text("INSERT INTO bronze_users (id, email, nom, role, is_active, created_at) VALUES (:id, :email, :nom, :role, :is_active, :created_at)"),
                    user
                )
            session.commit()
            return len(users)
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
```

**POURQUOI cette méthode ?**
- Création de table avec SQL brut
- Insertion en masse
- Gestion des transactions

### 10.5 Load Bronze - Agences, Clients, Engagements (À TOI DE FAIRE)

**Implémente les autres méthodes en suivant le pattern de `load_users` :**

**Pattern à suivre :**
- Créer la table avec SQL brut
- Insérer avec `session.execute`
- Gérer les transactions (commit/rollback)

**À toi de faire :** Implémente `load_agences`, `load_clients`, `load_engagements`

---

## Étape 11 : ETL Silver (1 heure)

### 11.1 Comprendre Silver

**Silver = Données nettoyées et validées.**

### 11.2 Transform Silver - Users (EXEMPLE COMPLET)

**Ouvre `etl/silver/transform_silver.py` (squelette déjà créé avec TODO). Voici l'exemple pour users :**

```python
from typing import List, Dict, Any
from datetime import datetime

class SilverTransformer:
    def validate_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        user["is_valid"] = True
        user["error_message"] = None
        user["ingested_at"] = datetime.now()
        
        # Validation
        if not user.get("email") or "@" not in user["email"]:
            user["is_valid"] = False
            user["error_message"] = "Email invalide"
        
        return user
```

**POURQUOI cette méthode ?**
- Ajoute les colonnes techniques (`is_valid`, `error_message`, `ingested_at`)
- Valide les données
- Retourne les données validées

### 11.3 Transform Silver - Agences, Clients, Engagements (À TOI DE FAIRE)

**Implémente les autres méthodes en suivant le pattern de `validate_user` :**

**Pattern à suivre :**
- Ajouter `is_valid`, `error_message`, `ingested_at`
- Valider les champs
- Retourner les données validées

**À toi de faire :** Implémente `validate_agence`, `validate_client`, `validate_engagement`

### 11.4 Load Silver (À TOI DE FAIRE)

**Implémente en suivant le pattern de Load Bronze :**

**Pattern à suivre :**
- Créer les tables silver (avec colonnes techniques)
- Insérer les données validées

**À toi de faire :** Implémente `etl/silver/load_silver.py`

---

## Étape 12 : ETL Gold (TON TRAVAIL - Data Modeling) (2 heures)

### 12.1 Comprendre Gold

**Gold = Data modeling (dimensions + fact tables).**

### 12.2 Définir ton data modeling

**C'est TON TRAVAIL de définir :**
- `dim_agences` : Dimension agences
- `dim_clients` : Dimension clients
- `fact_engagements` : Fact table engagements
- `fact_kpis` : Agrégations KPIs

**Questions à te poser :**
- Quelles colonnes inclure dans les dimensions ?
- Comment structurer les relations ?
- Quels KPIs calculer ?
- Comment optimiser pour le dashboard ?

### 12.3 Implémenter les fichiers Gold

**Ouvre les fichiers squelettes et implémente-les :**
- `etl/gold/dim_agences.py`
- `etl/gold/dim_clients.py`
- `etl/gold/fact_engagements.py`
- `etl/gold/aggregate_kpis.py`

**À toi de faire :** Définir et implémenter TON data modeling

---

## Étape 13 : Pipeline ETL (30 minutes)

### 13.1 Comprendre le pipeline

**Le pipeline orchestre Bronze → Silver → Gold.**

### 13.2 Implémenter etl_pipeline.py

**Ouvre `etl/etl_pipeline.py` (squelette déjà créé avec TODO). Implémente-le en suivant le pattern :**

**Pattern à suivre :**
- Méthode `run_bronze()` : Extraction + Chargement
- Méthode `run_silver()` : Transformation + Chargement
- Méthode `run_gold()` : Data modeling + Agrégations
- Méthode `run()` : Orchestration complète

**À toi de faire :** Implémente `etl/etl_pipeline.py`

---

## Résumé

Tu as maintenant un guide avec des EXEMPLES pour la première table/entité de chaque étape, et tu feras le reste en suivant le pattern.

**Fichiers TODO déjà créés :**
- Tous les squelettes sont déjà dans les dossiers avec TODO détaillés
- Tu peux les consulter pour voir la structure complète

**Commence par l'étape 1 et progresse étape par étape.**
