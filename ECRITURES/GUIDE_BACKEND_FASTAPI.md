# Guide Détaillé - Implémentation Backend FastAPI
## Saham Bank Analytics Portal

**Auteur :** Guide technique  
**Date :** 14 juillet 2026  
**Objectif :** Implémentation complète du backend FastAPI avec génération de données bancaires réalistes

---

## Table des Matières

1. [Organisation des Dossiers](#1-organisation-des-dossiers)
2. [Architecture du Backend](#2-architecture-du-backend)
3. [Installation et Setup](#3-installation-et-setup)
4. [Structure FastAPI Détaillée](#4-structure-fastapi-détaillée)
5. [Génération de Données Bancaires avec Faker](#5-génération-de-données-bancaires-avec-faker)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [Intégration Frontend-Backend](#8-intégration-frontend-backend)
9. [Déploiement](#9-déploiement)

---

## 1. Organisation des Dossiers

### Option Recommandée : Backend Séparé (Monorepo)

```
saham-bank-analytics-portal/          # Racine du projet
├── frontend/                         # Application React existante
│   ├── index.html
│   ├── script_logic.js
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                          # NOUVEAU : Backend FastAPI
│   ├── app/
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml                # Orchestration des deux services
├── .gitignore
└── README.md
```

### Pourquoi Backend Séparé ?

**Avantages :**
- **Isolation** : Dépendances Python et Node.js séparées
- **Scalabilité** : Backend et frontend peuvent être déployés indépendamment
- **Clarté** : Structure de projet professionnelle
- **Flexibilité** : Possibilité d'avoir plusieurs frontends (mobile, web) pour le même backend
- **Standard industrie** : C'est l'architecture la plus courante

**Inconvénients (mineurs) :**
- Communication via HTTP (nécessaire de toute façon en production)
- Deux environnements de développement à gérer

### Alternative : Backend dans le Même Dossier

```
saham-bank-analytics-portal/
├── index.html
├── script_logic.js
├── backend/                    # Dossier backend à côté des fichiers frontend
│   └── ...
└── package.json
```

**Quand choisir cette option ?**
- Si tu veux une structure plus simple
- Si tu n'as pas besoin de scaler indépendamment
- Pour un prototype rapide

**Recommandation :** Option backend séparé (monorepo) pour ce projet.

---

## 2. Architecture du Backend

### Stack Technique

| Composant | Technologie | Version | Raison |
|-----------|-------------|---------|--------|
| Framework | FastAPI | 0.104+ | Performance, type safety, auto-doc |
| Language | Python | 3.11+ | Écosystème IA riche |
| Database | PostgreSQL | 16+ | Relationnel mature, pgvector |
| ORM | SQLAlchemy | 2.0+ | Type-safe, migrations |
| Validation | Pydantic | 2.0+ | Validation automatique |
| Auth | python-jose | - | JWT tokens |
| Password | passlib | - | Hashing bcrypt |
| Data Gen | Faker | - | Génération données réalistes |
| CORS | python-multipart | - | Gestion CORS |

### Architecture en Couches

```
┌─────────────────────────────────────┐
│         Frontend (React)             │
│    http://localhost:3000             │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│         FastAPI Backend             │
│         (Port 8000)                  │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │   Routers (API Endpoints)    │  │
│  │   /auth, /clients, /ai, ...  │  │
│  └───────────────┬───────────────┘  │
│                  │                   │
│  ┌───────────────▼───────────────┐  │
│  │   Services (Business Logic)  │  │
│  │   AuthService, ClientService │  │
│  └───────────────┬───────────────┘  │
│                  │                   │
│  ┌───────────────▼───────────────┐  │
│  │   Models (Pydantic/SQLAlchemy)│  │
│  │   User, Client, Engagement    │  │
│  └───────────────┬───────────────┘  │
└──────────────────┼───────────────────┘
                   │
┌──────────────────▼───────────────────┐
│         PostgreSQL Database          │
│   (users, clients, engagements, ...) │
└─────────────────────────────────────┘
```

---

## 3. Installation et Setup

### 3.1 Création du Dossier Backend

```bash
# Depuis la racine du projet
cd c:\Users\user\Downloads\saham-bank-analytics-portal
mkdir backend
cd backend
```

### 3.2 Environnement Virtuel Python

```bash
# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement (Windows)
venv\Scripts\activate

# Activer l'environnement (Linux/Mac)
source venv/bin/activate
```

### 3.3 Installation des Dépendances

Créer `requirements.txt` :

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
faker==20.1.0
python-dotenv==1.0.0
alembic==1.13.0
```

Installer les dépendances :

```bash
pip install -r requirements.txt
```

### 3.4 Configuration Environment

Créer `.env` dans `backend/` :

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/saham_bank
DATABASE_TEST_URL=postgresql://postgres:password@localhost:5432/saham_bank_test

# Security
SECRET_KEY=votre-secret-key-tres-long-et-complexe
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:3000

# AI (optionnel pour l'instant)
GOOGLE_API_KEY=votre-api-key-gemini
```

---

## 4. Structure FastAPI Détaillée

### 4.1 Arborescence Complète

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Application FastAPI principale
│   ├── config.py               # Configuration (variables env)
│   ├── database.py             # Configuration DB + session
│   ├── models/                 # Modèles SQLAlchemy (DB)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── client.py
│   │   ├── engagement.py
│   │   ├── agence.py
│   │   └── ai_query.py
│   ├── schemas/                # Modèles Pydantic (API)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── client.py
│   │   ├── engagement.py
│   │   └── token.py
│   ├── routers/                # Routes API
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── clients.py
│   │   ├── engagements.py
│   │   ├── dashboard.py
│   │   ├── ai.py
│   │   └── admin.py
│   ├── services/               # Logique métier
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── client_service.py
│   │   └── ai_service.py
│   ├── core/                   # Utilitaires core
│   │   ├── __init__.py
│   │   ├── security.py         # JWT, password hashing
│   │   ├── deps.py             # Dependencies (get_current_user)
│   │   └── config.py
│   └── db_seed/                # Scripts de génération de données
│       ├── __init__.py
│       ├── seed_users.py
│       ├── seed_clients.py
│       ├── seed_engagements.py
│       └── seed_all.py
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_clients.py
│   └── conftest.py
├── alembic/                    # Migrations DB
│   ├── versions/
│   └── env.py
├── alembic.ini
├── requirements.txt
├── .env
├── .env.example
└── Dockerfile
```

### 4.2 Fichiers Principaux

#### `app/main.py` - Point d'entrée

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine
from app.models import user, client, engagement, agence
from app.routers import auth, clients, engagements, dashboard, ai, admin

# Créer les tables
user.Base.metadata.create_all(bind=engine)
client.Base.metadata.create_all(bind=engine)
engagement.Base.metadata.create_all(bind=engine)
agence.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Saham Bank Analytics API",
    description="API pour le portail analytique Saham Bank",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(engagements.router, prefix="/api/engagements", tags=["Engagements"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Assistant"])
app.include_router(admin.router, prefix="/api/admin", tags=["Administration"])

@app.get("/")
def root():
    return {"message": "Saham Bank Analytics API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

#### `app/config.py` - Configuration

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    DATABASE_TEST_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

#### `app/database.py` - Configuration DB

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 5. Génération de Données Bancaires avec Faker

### 5.1 Faker peut-il créer des données bancaires réalistes ?

**OUI**, mais avec des customisations. Faker fournit des données de base, mais nous devons adapter pour le secteur bancaire marocain.

### 5.2 Ce que Faker fournit nativement

```python
from faker import Faker

fake = Faker('fr_MA')  # Localisation Maroc

# Noms et adresses
fake.name()           # "Youssef Benali"
fake.address()        # "123 Rue Mohammed V, Casablanca"
fake.phone_number()   # "+212 6XX-XXXXXX"
fake.email()          # "youssef.benali@example.com"

# Dates
fake.date_between(start_date='-5y', end_date='today')
fake.date_time_this_year()

# Nombres
fake.random_int(min=10000, max=1000000)
fake.pyfloat(left_digits=2, right_digits=2, positive=True)

# Entreprises
fake.company()        # "Société Anonyme..."
fake.iban()           # IBAN (mais pas format Maroc)
```

### 5.3 Customisation pour Secteur Bancaire Marocain

Nous devons créer des providers personnalisés pour :

1. **Segments bancaires marocains**
2. **Types de crédits islamiques**
3. **Scores de risque réalistes**
4. **Agences bancaires réelles**
5. **Montants en MAD**

### 5.4 Script de Génération Complet

#### `app/db_seed/seed_clients.py`

```python
import random
from faker import Faker
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.client import Client

fake = Faker('fr_MA')

# Données spécifiques au secteur bancaire marocain
SEGMENTS = ['Particuliers', 'Professionnels', 'PME', 'Grandes Entreprises', 'Premium']
AGENCES = [
    'Casablanca Anfa', 'Casablanca Maarif', 'Rabat Agdal', 'Rabat Hassan',
    'Marrakech Gueliz', 'Agadir Centre', 'Fès Ville Nouvelle', 'Tanger Marina'
]
VILLES = ['Casablanca', 'Rabat', 'Marrakech', 'Agadir', 'Fès', 'Tanger', 'Oujda', 'Meknès']

def generate_client_data(n: int = 100):
    """Génère n clients avec données bancaires réalistes"""
    clients = []
    
    for i in range(n):
        segment = random.choice(SEGMENTS)
        agence = random.choice(AGENCES)
        ville = agence.split(' ')[0]
        
        # Encours basé sur le segment
        base_encours = {
            'Particuliers': 50000,
            'Professionnels': 200000,
            'PME': 1000000,
            'Grandes Entreprises': 5000000,
            'Premium': 300000
        }[segment]
        
        encours = random.randint(int(base_encours/2), int(base_encours * 2))
        
        # Score de risque corrélé au segment
        base_score = {
            'Grandes Entreprises': 85,
            'Premium': 80,
            'Particuliers': 65,
            'Professionnels': 60,
            'PME': 55
        }[segment]
        
        score = base_score + random.randint(-15, 15)
        score = max(10, min(99, score))
        
        # Statut basé sur le score
        if score < 40:
            statut = 'À risque'
        elif score < 25:
            statut = 'Défaut'
        else:
            statut = 'Actif'
        
        client = {
            'id': f'CLI-{10000+i}',
            'nom': f"{fake.first_name()} {fake.last_name()}",
            'segment': segment,
            'agence': agence,
            'ville': ville,
            'encours': encours,
            'score': score,
            'statut': statut,
            'age': random.randint(22, 70),
            'email': fake.email(),
            'telephone': fake.phone_number(),
            'date_creation': fake.date_between(start_date='-5y', end_date='today')
        }
        clients.append(client)
    
    return clients

def seed_clients(db: Session, n: int = 100):
    """Insère les clients en base de données"""
    clients_data = generate_client_data(n)
    
    for client_data in clients_data:
        client = Client(**client_data)
        db.add(client)
    
    db.commit()
    print(f"✅ {n} clients générés et insérés en base")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_clients(db, n=100)
    finally:
        db.close()
```

#### `app/db_seed/seed_engagements.py`

```python
import random
from faker import Faker
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.engagement import Engagement
from app.models.client import Client

fake = Faker('fr_MA')

TYPES_CREDIT = [
    'Mourabaha Immo', 'Ijara', 'Mourabaha Auto', 
    'Crédit Tréso', 'Investissement PME'
]

STATUTS_DOSSIER = ['En analyse', 'Validé', 'Débloqué', 'Surveillance', 'Contentieux']

def generate_engagement_data(db: Session, n: int = 35):
    """Génère n dossiers de crédit"""
    # Récupérer les clients existants
    clients = db.query(Client).all()
    
    engagements = []
    
    for i in range(n):
        client = random.choice(clients)
        
        engagement = {
            'ref': f'SBK-{fake.year()}-{1000+i}',
            'client_id': client.id,
            'client_nom': client.nom,
            'type': random.choice(TYPES_CREDIT),
            'montant': random.randint(100000, 2000000),
            'duree': random.choice([12, 24, 36, 48, 60, 120, 240]),
            'taux': round(random.uniform(2.0, 5.0), 2),
            'score': client.score,
            'statut': random.choice(STATUTS_DOSSIER),
            'date_depot': fake.date_between(start_date='-2y', end_date='today'),
            'agence': client.agence
        }
        engagements.append(engagement)
    
    return engagements

def seed_engagements(db: Session, n: int = 35):
    """Insère les engagements en base de données"""
    engagements_data = generate_engagement_data(db, n)
    
    for engagement_data in engagements_data:
        engagement = Engagement(**engagement_data)
        db.add(engagement)
    
    db.commit()
    print(f"✅ {n} dossiers de crédit générés et insérés en base")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_engagements(db, n=35)
    finally:
        db.close()
```

#### `app/db_seed/seed_users.py`

```python
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def seed_users(db: Session):
    """Crée les utilisateurs par défaut avec rôles"""
    users = [
        {
            'email': 'dg@saham.ma',
            'password': hash_password('dg123'),
            'nom': 'Directeur Général',
            'role': 'DG',
            'agence': 'Siège Casa',
            'actif': True
        },
        {
            'email': 'dr.casa@saham.ma',
            'password': hash_password('dr123'),
            'nom': 'Directeur Régional Casa',
            'role': 'DR',
            'agence': 'Casablanca',
            'actif': True
        },
        {
            'email': 'ca.anfa@saham.ma',
            'password': hash_password('ca123'),
            'nom': 'Chef Agence Anfa',
            'role': 'CA',
            'agence': 'Casablanca Anfa',
            'actif': True
        },
        {
            'email': 'ar.anfa@saham.ma',
            'password': hash_password('ar123'),
            'nom': 'Agent Relation Anfa',
            'role': 'AR',
            'agence': 'Casablanca Anfa',
            'actif': True
        },
        {
            'email': 'admin@saham.ma',
            'password': hash_password('admin123'),
            'nom': 'Administrateur Système',
            'role': 'Admin',
            'agence': 'Siège Casa',
            'actif': True
        }
    ]
    
    for user_data in users:
        # Vérifier si l'utilisateur existe déjà
        existing = db.query(User).filter(User.email == user_data['email']).first()
        if not existing:
            user = User(**user_data)
            db.add(user)
    
    db.commit()
    print("✅ 5 utilisateurs par défaut créés (DG, DR, CA, AR, Admin)")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()
```

#### `app/db_seed/seed_all.py`

```python
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.db_seed.seed_users import seed_users
from app.db_seed.seed_clients import seed_clients
from app.db_seed.seed_engagements import seed_engagements

def seed_all():
    """Exécute tous les scripts de seed"""
    db = SessionLocal()
    try:
        print("🌱 Début de la génération des données...")
        seed_users(db)
        seed_clients(db, n=100)
        seed_engagements(db, n=35)
        print("✅ Génération terminée avec succès !")
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
```

### 5.5 Pourquoi cette approche est réaliste ?

1. **Corrélation des données** : Le score de risque est corrélé au segment
2. **Montants cohérents** : PME ont des encours plus élevés que particuliers
3. **Types de crédits réels** : Mourabaha, Ijara (finance islamique marocaine)
4. **Agences réelles** : Noms d'agences bancaires marocaines
5. **Distribution statistique** : Pas de valeurs aberrantes

---

## 6. Database Schema

### 6.1 Modèles SQLAlchemy

#### `app/models/user.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    nom = Column(String, nullable=False)
    role = Column(String, nullable=False)  # DG, DR, CA, AR, Admin
    agence = Column(String)
    actif = Column(Boolean, default=True)
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
```

#### `app/models/client.py`

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, Date
from sqlalchemy.sql import func
from app.database import Base

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True)  # CLI-XXXXX
    nom = Column(String, nullable=False)
    segment = Column(String, nullable=False)
    agence = Column(String, nullable=False)
    ville = Column(String, nullable=False)
    encours = Column(Float, nullable=False)
    score = Column(Integer, nullable=False)
    statut = Column(String, nullable=False)
    age = Column(Integer)
    email = Column(String)
    telephone = Column(String)
    date_creation = Column(Date)
```

#### `app/models/engagement.py`

```python
from sqlalchemy import Column, String, Float, Integer, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Engagement(Base):
    __tablename__ = "engagements"
    
    ref = Column(String, primary_key=True)
    client_id = Column(String, ForeignKey("clients.id"))
    client_nom = Column(String, nullable=False)
    type = Column(String, nullable=False)
    montant = Column(Float, nullable=False)
    duree = Column(Integer, nullable=False)
    taux = Column(Float, nullable=False)
    score = Column(Integer, nullable=False)
    statut = Column(String, nullable=False)
    date_depot = Column(Date)
    agence = Column(String)
```

### 6.2 Schémas Pydantic (API)

#### `app/schemas/user.py`

```python
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    nom: str
    role: str
    agence: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    actif: bool
    date_creation: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
```

---

## 7. API Endpoints

### 7.1 Authentication (`app/routers/auth.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, User as UserSchema, Token
from app.core.security import verify_password, create_access_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    if not user.actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    from app.core.deps import get_current_user
    user = get_current_user(token, db)
    return user
```

### 7.2 Clients (`app/routers/clients.py`)

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.client import Client
from app.schemas.client import Client as ClientSchema

router = APIRouter()

@router.get("/", response_model=List[ClientSchema])
def get_clients(
    skip: int = 0,
    limit: int = 100,
    segment: Optional[str] = None,
    agence: Optional[str] = None,
    statut: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Client)
    
    if segment:
        query = query.filter(Client.segment == segment)
    if agence:
        query = query.filter(Client.agence == agence)
    if statut:
        query = query.filter(Client.statut == statut)
    
    clients = query.offset(skip).limit(limit).all()
    return clients

@router.get("/{client_id}", response_model=ClientSchema)
def get_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    return client
```

### 7.3 Dashboard (`app/routers/dashboard.py`)

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.client import Client
from app.models.engagement import Engagement

router = APIRouter()

@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    total_clients = db.query(Client).count()
    total_encours = db.query(func.sum(Client.encours)).scalar() or 0
    avg_score = db.query(func.avg(Client.score)).scalar() or 0
    total_engagements = db.query(Engagement).count()
    
    return {
        "total_clients": total_clients,
        "total_encours": total_encours,
        "avg_score": round(avg_score, 1),
        "total_engagements": total_engagements
    }

@router.get("/segments")
def get_segments(db: Session = Depends(get_db)):
    segments = db.query(
        Client.segment,
        func.count(Client.id).label('count'),
        func.sum(Client.encours).label('total_encours')
    ).group_by(Client.segment).all()
    
    return [
        {"segment": s.segment, "count": s.count, "encours": s.total_encours}
        for s in segments
    ]
```

---

## 8. Intégration Frontend-Backend

### 8.1 Modification du Frontend

Dans `script_logic.js`, remplacer les données mockées par des appels API :

```javascript
// AVANT (données mockées)
const MOCK = {
    clients: [...],
    dossiers: [...]
};

// APRÈS (appels API)
async function fetchClients() {
    const response = await fetch('http://localhost:8000/api/clients/', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return await response.json();
}

async function fetchKPIs() {
    const response = await fetch('http://localhost:8000/api/dashboard/kpis', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return await response.json();
}
```

### 8.2 Configuration CORS

Le backend FastAPI doit autoriser les requêtes depuis le frontend (déjà configuré dans `main.py`).

### 8.3 Docker Compose

Créer `docker-compose.yml` à la racine :

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: saham_bank
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/saham_bank
    depends_on:
      - postgres
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 9. Déploiement

### 9.1 Lancer le Backend en Développement

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 9.2 Lancer la Génération de Données

```bash
cd backend
python -m app.db_seed.seed_all
```

### 9.3 Accéder à la Documentation Auto

Ouvrir : `http://localhost:8000/docs` (Swagger UI)

### 9.4 Tester les Endpoints

```bash
# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@saham.ma&password=admin123"

# Get clients
curl -X GET "http://localhost:8000/api/clients/" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## Résumé des Étapes

1. ✅ Créer le dossier `backend/` séparé
2. ✅ Setup environnement virtuel Python
3. ✅ Installer les dépendances (FastAPI, SQLAlchemy, Faker)
4. ✅ Créer la structure de dossiers (app/, models/, routers/, etc.)
5. ✅ Configurer PostgreSQL
6. ✅ Créer les modèles SQLAlchemy (User, Client, Engagement)
7. ✅ Créer les schémas Pydantic
8. ✅ Implémenter les routers (auth, clients, dashboard)
9. ✅ Créer les scripts de seed avec Faker personnalisé
10. ✅ Lancer la génération de données
11. ✅ Tester l'API avec Swagger UI
12. ✅ Modifier le frontend pour appeler l'API
13. ✅ Configurer Docker Compose pour le déploiement

---

## Questions Fréquentes

**Q : Backend doit-il être dans un dossier séparé ?**  
R : Oui, c'est recommandé pour la séparation des responsabilités et la scalabilité.

**Q : Faker peut-il créer des données bancaires réalistes ?**  
R : Oui, avec des customisations. Nous avons créé des providers spécifiques pour le secteur bancaire marocain.

**Q : FastAPI sera-t-il dans son propre dossier ?**  
R : Oui, tout le backend (FastAPI + Python) sera dans le dossier `backend/`.

**Q : Comment connecter le frontend existant au nouveau backend ?**  
R : En remplaçant les données mockées par des appels `fetch()` aux endpoints FastAPI.

**Q : Quand les données réelles seront-elles utilisées ?**  
R : Quand ton encadrante te les fournira. Tu pourras alors remplacer les scripts de seed par des connecteurs ETL.
