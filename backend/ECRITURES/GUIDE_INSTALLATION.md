# Guide d'Installation et Configuration - Saham Bank Backend

## Étape 1 : Vérifier et installer les prérequis

### 1.1 Vérifier Python

**Ouvrir un terminal (PowerShell) et taper :**
```bash
python --version
```

**Si Python n'est pas installé :**
- Télécharger Python 3.10+ depuis https://www.python.org/downloads/
- Installer en cochant "Add Python to PATH"
- Vérifier avec `python --version`

### 1.2 Vérifier pip

**Dans le terminal :**
```bash
pip --version
```

**Si pip n'est pas installé :**
```bash
python -m ensurepip --upgrade
```

### 1.3 Installer PostgreSQL

**Télécharger PostgreSQL 16 depuis :**
- https://www.postgresql.org/download/windows/

**Pendant l'installation :**
- Mot de passe postgres : **choisir un mot de passe et le noter**
- Port : 5432 (par défaut)
- Cocher pgAdmin (optionnel mais utile)

**Vérifier l'installation :**
```bash
psql --version
```

**Si psql n'est pas reconnu :**
- Ajouter `C:\Program Files\PostgreSQL\16\bin` au PATH Windows
- Ou utiliser pgAdmin pour vérifier

### 1.4 Créer une base de données

**Ouvrir pgAdmin ou psql :**

**Avec psql (terminal) :**
```bash
psql -U postgres
```

**Puis taper :**
```sql
CREATE DATABASE saham_bank;
\q
```

**Avec pgAdmin :**
- Clic droit sur Databases → Create → Database
- Nom : saham_bank
- Owner : postgres

## Étape 2 : Configurer l'environnement Python

### 2.1 Créer un environnement virtuel

**Dans le dossier saham-bank-backend :**
```bash
cd c:\Users\user\Downloads\saham-bank-backend
python -m venv venv
```

### 2.2 Activer l'environnement virtuel

**Dans PowerShell :**
```bash
.\venv\Scripts\Activate.ps1
```

**Si erreur d'exécution de scripts :**
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2.3 Installer les dépendances

**Créer un fichier requirements.txt dans saham-bank-backend :**
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
```

**Installer les dépendances :**
```bash
pip install -r requirements.txt
```

## Étape 3 : Configurer les variables d'environnement

### 3.1 Créer un fichier .env

**Dans saham-bank-backend, créer un fichier .env :**
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

**IMPORTANT : Remplacer TON_MOT_DE_PASSE par ton mot de passe PostgreSQL**

## Étape 4 : Vérifier la connexion à PostgreSQL

### 4.1 Créer un script de test

**Créer un fichier test_db.py dans saham-bank-backend :**
```python
import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="saham_bank",
        user="postgres",
        password="TON_MOT_DE_PASSE"
    )
    print("Connexion réussie à PostgreSQL !")
    conn.close()
except Exception as e:
    print(f"Erreur de connexion : {e}")
```

**Exécuter le script :**
```bash
python test_db.py
```

**Si erreur :**
- Vérifier que PostgreSQL est démarré (Services Windows)
- Vérifier le mot de passe
- Vérifier que la base de données saham_bank existe

## Étape 5 : Installer pgvector (optionnel pour l'IA)

**pgvector est une extension PostgreSQL pour les vecteurs (IA).**

**Si tu veux l'IA :**

1. **Télécharger pgvector :**
   - https://github.com/pgvector/pgvector/releases
   - Télécharger pgvector-windows.zip

2. **Installer pgvector :**
   - Copier les fichiers dans `C:\Program Files\PostgreSQL\16\lib`
   - Exécuter dans PostgreSQL :
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

**Si tu ne veux pas l'IA pour l'instant :**
- Tu peux l'installer plus tard
- Le backend fonctionnera sans pgvector

## Étape 6 : Tester l'installation

### 6.1 Créer un script de test complet

**Créer un fichier test_installation.py dans saham-bank-backend :**
```python
print("Test de l'installation...")

# Test Python
import sys
print(f"Python version : {sys.version}")

# Test FastAPI
try:
    import fastapi
    print("✓ FastAPI installé")
except ImportError:
    print("✗ FastAPI non installé")

# Test SQLAlchemy
try:
    import sqlalchemy
    print("✓ SQLAlchemy installé")
except ImportError:
    print("✗ SQLAlchemy non installé")

# Test psycopg2
try:
    import psycopg2
    print("✓ psycopg2 installé")
except ImportError:
    print("✗ psycopg2 non installé")

# Test Faker
try:
    import faker
    print("✓ Faker installé")
except ImportError:
    print("✗ Faker non installé")

# Test connexion PostgreSQL
try:
    import psycopg2
    from dotenv import load_dotenv
    import os
    
    load_dotenv()
    
    conn = psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        database=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD")
    )
    print("✓ Connexion PostgreSQL réussie")
    conn.close()
except Exception as e:
    print(f"✗ Erreur connexion PostgreSQL : {e}")

print("Test terminé !")
```

**Exécuter le script :**
```bash
python test_installation.py
```

## Étape 7 : Prêt à coder

**Une fois tous les tests passés :**
1. Lis le Cahier des Charges
2. Lis le Guide Pédagogique Backend
3. Commence à implémenter les squelettes

## Problèmes fréquents

### Problème : "python n'est pas reconnu"
**Solution :**
- Réinstaller Python en cochant "Add Python to PATH"
- Redémarrer le terminal

### Problème : "psql n'est pas reconnu"
**Solution :**
- Ajouter PostgreSQL au PATH Windows
- Ou utiliser pgAdmin à la place

### Problème : "Erreur de connexion PostgreSQL"
**Solution :**
- Vérifier que PostgreSQL est démarré (Services Windows)
- Vérifier le mot de passe dans .env
- Vérifier que la base de données saham_bank existe

### Problème : "Erreur d'exécution de scripts PowerShell"
**Solution :**
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Résumé

1. ✓ Python 3.10+ installé
2. ✓ pip installé
3. ✓ PostgreSQL 16 installé
4. ✓ Base de données saham_bank créée
5. ✓ Environnement virtuel créé
6. ✓ Dépendances installées
7. ✓ Fichier .env configuré
8. ✓ Connexion PostgreSQL testée

Une fois tout vérifié, tu peux commencer l'implémentation !
