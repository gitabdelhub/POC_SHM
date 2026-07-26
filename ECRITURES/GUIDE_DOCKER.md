# Guide Docker — Containeriser l'application

> Objectif : PostgreSQL + FastAPI backend dans des containers Docker

---

## Étape 1 : Installer Docker Desktop

1. Va sur [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Télécharge et installe Docker Desktop
3. Ouvre Docker Desktop (une baleine dans la barre des tâches)
4. Vérifie que ça marche :
   ```bash
   docker --version
   docker compose version
   ```

---

## Étape 2 : Structure des fichiers

Dans la racine du projet, crée deux fichiers :

```
saham-bank-analytics-portal/
├── saham-bank-backend/
│   ├── Dockerfile          ← À créer
│   └── ...
├── docker-compose.yml      ← À créer
└── ...
```

---

## Étape 3 : Créer le Dockerfile (backend)

Crée `saham-bank-backend/Dockerfile` et écris ceci ligne par ligne :

```dockerfile
# 1. Image de base Python
FROM python:3.12-slim

# 2. Dossier de travail dans le container
WORKDIR /app

# 3. Copier les dépendances d'abord (optimisation cache Docker)
COPY requirements.txt .

# 4. Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copier tout le code backend
COPY . .

# 6. Port expose (celui de FastAPI)
EXPOSE 8000

# 7. Commande au démarrage
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

> **Pourquoi cette structure ?**
> - Les `COPY` sont séparés pour que Docker mette en cache `pip install` tant que `requirements.txt` ne change pas
> - `--no-cache-dir` réduit la taille de l'image
> - `python:3.12-slim` est une image légère

---

## Étape 4 : Créer docker-compose.yml

Crée `docker-compose.yml` à la racine :

```yaml
version: '3.8'

services:
  # Service 1 : PostgreSQL
  postgres:
    image: postgres:16
    container_name: saham-postgres
    environment:
      POSTGRES_DB: saham_bank
      POSTGRES_USER: saham_user
      POSTGRES_PASSWORD: saham_pass_2026
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U saham_user -d saham_bank"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Service 2 : API FastAPI
  backend:
    build:
      context: ./saham-bank-backend
      dockerfile: Dockerfile
    container_name: saham-backend
    environment:
      DATABASE_URL: postgresql://saham_user:saham_pass_2026@postgres:5432/saham_bank
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    command: >
      sh -c "sleep 3 && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

volumes:
  postgres_data:
```

> **Explication :**
> - `services` : chaque container est un "service"
> - `postgres` : utilise l'image officielle PostgreSQL 16
> - `backend` : build notre Dockerfile, dépend de postgres (attend le healthcheck)
> - `volumes` : les données PostgreSQL persistent même si on stoppe le container
> - `environment` : variables d'environnement pour la connexion

---

## Étape 5 : Lancer tout

```bash
# 1. Build et démarre les containers
docker compose up --build

# 2. Vérifie que les deux containers tournent
docker ps
# Tu dois voir : saham-postgres ET saham-backend

# 3. Teste l'API
# Ouvre un navigateur à : http://localhost:8000/docs
# Tu devrais voir la doc Swagger de FastAPI

# 4. Arrêter
docker compose down

# 5. Arrêter + supprimer les volumes (données perdues)
docker compose down -v
```

---

## Étape 6 : Commandes utiles

```bash
# Voir les logs en temps réel
docker compose logs -f

# Exécuter une commande dans le container backend
docker compose exec backend bash

# Se connecter à PostgreSQL
docker compose exec postgres psql -U saham_user -d saham_bank

# Rebuild sans cache
docker compose build --no-cache

# Lister les volumes
docker volume ls
```

---

## Étape 7 : Tester l'ETL dans le container

```bash
# 1. Entre dans le container backend
docker compose exec backend bash

# 2. Génère les données
python etl/generate_data.py

# 3. Lance l'ETL complet
python etl/etl_pipeline.py

# 4. Vérifie les données dans PostgreSQL
docker compose exec postgres psql -U saham_user -d saham_bank
\dt
SELECT count(*) FROM dim_client;
SELECT count(*) FROM fact_engagement;
```

---

## Problèmes courants

| Problème | Solution |
|---|---|
| Port 5432 déjà utilisé | Change le port : `"5433:5432"` (host:container) |
| `pg_isready` échoue | Vérifie que PostgreSQL a le temps de démarrer : `sleep 10` |
| Connexion refusée | Vérifie `DATABASE_URL` dans `docker-compose.yml` |
| Module introuvable | Vérifie que `requirements.txt` contient bien toutes les dépendances |

---

## Et après ?

Une fois Docker fonctionnel, passe à `GUIDE_CICD_GITHUB_ACTIONS.md` pour automatiser les tests et le déploiement.
