# Guide de Lancement - Saham Bank Analytics Portal

## Architecture du Projet

```
saham-bank-analytics-portal/
├── frontend/         ← Application web (HTML/CSS/JS, Vite, Chart.js)
│   ├── index.html       Page unique avec login et dashboard
│   ├── server.cjs       Serveur Express (port 3000)
│   ├── package.json     Dépendances Node.js
│   ├── vite.config.ts   Configuration Vite
│   └── dist/            Build de production
│
├── backend/          ← API REST (FastAPI, SQLAlchemy, PostgreSQL)
│   ├── app/             Code source de l'API
│   │   ├── main.py          Point d'entrée FastAPI
│   │   ├── database.py      Connexion PostgreSQL
│   │   ├── models/          Modèles SQLAlchemy
│   │   ├── schemas/         Schémas Pydantic
│   │   ├── routers/         Endpoints API
│   │   │   ├── auth.py      Authentification (optionnel)
│   │   │   ├── clients.py   CRUD clients
│   │   │   ├── agences.py   CRUD agences
│   │   │   ├── engagements.py CRUD engagements
│   │   │   └── gold.py      Agrégations warehouse
│   │   └── core/security.py JWT / hash
│   ├── etl/             Pipeline Bronze → Silver → Gold
│   │   ├── generate_data.py  Génération des données CSV
│   │   ├── bronze/           Import CSV brut
│   │   ├── silver/           Nettoyage et validation
│   │   └── gold/             Star schema (dim_* + fact_*)
│   ├── .env             Configuration base de données
│   └── requirements.txt
│
├── scripts/          ← Utilitaires
│   ├── start.ps1      Lancement complet (frontend + backend)
│
└── ECRITURES/        ← Documentation
    └── GUIDE_LANCEMENT.md   ← Ce fichier
```

## Prérequis

- **Windows 10/11** avec PowerShell 5.1+
- **PostgreSQL 18** installé et en cours d'exécution sur `localhost:5432`
- **Node.js 20+** installé
- **Python 3.10+** avec venv

## Base de données

La base `saham_bank` doit exister dans PostgreSQL. Les tables sont créées automatiquement par l'ETL.

```powershell
# Vérifier que PostgreSQL tourne
Get-Service postgresql*

# Tester la connexion
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d saham_bank -c "\l"
```

## Lancement Rapide

### Méthode 1 : Script automatique (recommandé)

```powershell
# Depuis la racine du projet
powershell -ExecutionPolicy Bypass -File scripts\start.ps1
```

Ce script :
1. Construit le frontend (vite build)
2. Démarre le backend sur le port **8000**
3. Démarre le frontend sur le port **3000**
4. Affiche le statut des deux serveurs

### Méthode 2 : Manuellement

**Étape 1 - Backend API**
```powershell
cd backend
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Étape 2 - Frontend**
```powershell
cd frontend
# Option A : Serveur Express (production)
node server.cjs

# Option B : Serveur de développement Vite (avec HMR)
npm run dev
```

## Accès

| Composant   | URL                          |
|-------------|------------------------------|
| Site Web    | http://localhost:3000         |
| API (docs)  | http://localhost:8000/docs    |
| Santé API   | http://localhost:8000/health  |
| KPIs Gold   | http://localhost:8000/gold/kpis |

**Connexion au site :** L'authentification est désactivée. Vous accédez directement au tableau de bord en tant que Directeur Général (DG). Cliquez sur le profil en haut à droite pour changer de rôle.

## Vérification

```powershell
# 1. L'API répond-elle ?
Invoke-RestMethod http://localhost:8000/health
# Réponse : @{status="healthy"}

# 2. Les données Gold sont-elles chargées ?
Invoke-RestMethod http://localhost:8000/gold/kpis
# Réponse : total_clients, total_encours, npl_moyen, total_agences

# 3. Les tables en base existent-elles ?
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d saham_bank -c "\dt gold.*"
# Résultat : dim_*, fact_* (9 tables)
```

## Arrêter le Site

```powershell
# Méthode rapide (tue tous les processus Python et Node)
taskkill /F /IM python.exe; taskkill /F /IM node.exe

# Méthode précise (par port)
$apiPID = (netstat -ano | findstr ":8000").Trim().Split()[-1]
$frontPID = (netstat -ano | findstr ":3000").Trim().Split()[-1]
kill $apiPID; kill $frontPID
```

## Résolution de Problèmes

| Problème                     | Solution                                              |
|------------------------------|-------------------------------------------------------|
| Port 8000 déjà utilisé       | `netstat -ano \| findstr ":8000"` → kill le process    |
| Port 3000 déjà utilisé       | `netstat -ano \| findstr ":3000"` → kill le process    |
| Erreur de connexion PostgreSQL | Vérifier que le service tourne et que `.env` est correct |
| Frontend page blanche        | Rebuild : `cd frontend && npm run build`              |
| API ne répond pas            | Vérifier les logs : `backend/app.log`                 |
| Tables manquantes            | Relancer l'ETL : `cd backend && venv\Scripts\python.exe etl\run_gold.py` |

## Reconstruction Complète (ETL)

```powershell
cd backend

# 1. Générer les données CSV
venv\Scripts\python.exe etl\generate_data.py

# 2. Bronze → Silver
venv\Scripts\python.exe -m etl.run_bronze
venv\Scripts\python.exe -m etl.run_silver

# 3. Silver → Gold (star schema)
venv\Scripts\python.exe -m etl.run_gold

# 4. Peupler les tables modèles (CRUD API)
venv\Scripts\python.exe _seed_models.py
```
