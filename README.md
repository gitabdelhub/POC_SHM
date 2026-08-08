# Saham Bank Analytics Portal

POC de portail d'analyse pour Saham Bank : ETL (Bronze → Silver → Gold),
API FastAPI et frontend web vanilla (un seul fichier `index.html`).

## Démarrage rapide avec Docker (recommandé)

Prérequis : [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up --build
```

Au premier démarrage, le conteneur `api` initialise la base PostgreSQL
(schéma + données ETL complètes + comptes de démo) automatiquement. Ensuite :

- Portail web : http://localhost:3000
- API + documentation interactive : http://localhost:8000/docs
- API health : http://localhost:8000/health

> Le mot de passe PostgreSQL est configurables via la variable d'environnement
> `POSTGRES_PASSWORD` (défaut : `postgre_abdel`).

## Structure

- `backend/` : ETL + API FastAPI (uvicorn)
  - `etl/` : simulateur de données + pipeline Bronze → Silver → Gold
  - `app/` : API FastAPI (`app.main:app`), routeurs, sécurité JWT
  - `tests/` : suite pytest
- `frontend/` : portail web (fichier unique `frontend/index.html` + logo)
- `backend/app/scheduler.py` : planification légère du pipeline (APScheduler)
- `render.yaml` : configuration de déploiement cloud (API + Cron ETL)

## Prérequis

- Python 3.12
- PostgreSQL (base `saham_bank`, connexion configurée dans `backend/.env`)

## Installation

```bash
cd backend
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
```

## Génération des données (ETL)

```bash
cd backend
.\venv\Scripts\python -m etl.run_pipeline      # bronze + silver + gold
```

En conditions de production, le pipeline est relancé quotidiennement par le
planificateur intégré (APScheduler) :

```bash
cd backend
$env:ETL_SCHEDULER_ENABLED="true"; $env:ETL_SCHEDULE_HOUR="2"   # daily à 02:00
.\venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Ou déclenché manuellement via l'API (JWT requis, rôles DG/ADMIN) :

```bash
curl -X POST http://localhost:8000/etl/run -H "Authorization: Bearer $TOKEN"
```

Pour le cloud (Render), voir `render.yaml` (Cron Job quotidien).

## Démarrage de l'API

```bash
cd backend
.\venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

- Documentation interactive : http://localhost:8000/docs
- Health : http://localhost:8000/health

## Démarrage du frontend

Le frontend est un fichier statique unique. Il suffit d'un serveur statique sur
le dossier `frontend/` :

```bash
cd frontend
python -m http.server 5500
```

Puis ouvrir http://localhost:5500

> L'API est appelée via `API_BASE = 'http://localhost:8000'` (défini dans
> `frontend/index.html`).

## Tests

```bash
cd backend
.\venv\Scripts\python -m pytest -q
```

## Comptes de démonstration

Login préconfiguré : mot de passe `Demo2026!` pour tous les rôles démo
(voir `backend/app/seed_demo.py`).
