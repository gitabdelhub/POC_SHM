# Guide CI/CD — GitHub Actions

> Automatiser les tests et le déploiement à chaque push sur GitHub

---

## Étape 1 : Créer le dossier de workflows

Dans ton projet, crée ce dossier :

```
saham-bank-analytics-portal/
├── .github/
│   └── workflows/
│       └── ci.yml          ← À créer
└── ...
```

> **Comment faire :** Dans ton IDE, crée un dossier `.github` (avec le point devant), dedans `workflows`, dedans `ci.yml`.

---

## Étape 2 : Écrire le workflow CI (fichier .github/workflows/ci.yml)

```yaml
name: CI Saham Bank

# Déclencheurs : quand le workflow s'exécute
on:
  push:
    branches: [main, develop]  # Sur push vers main ou develop
  pull_request:
    branches: [main]           # Sur PR vers main

# Les jobs (tâches) à exécuter
jobs:
  # Job 1 : Tests Python
  test-backend:
    # Machine virtuelle Ubuntu
    runs-on: ubuntu-latest

    # Stratégie : tester plusieurs versions Python
    strategy:
      matrix:
        python-version: ['3.11', '3.12']

    # Les étapes du job
    steps:
      # 1. Récupère le code
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. Installe Python
      - name: Setup Python ${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      # 3. Installe les dépendances
      - name: Install dependencies
        working-directory: ./saham-bank-backend
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      # 4. Vérifie la syntaxe Python
      - name: Check Python syntax
        working-directory: ./saham-bank-backend
        run: |
          python -m py_compile etl/generate_data.py
          python -m py_compile etl/etl_pipeline.py
          python -m py_compile app/main.py

      # 5. Vérifie que generate_data.py peut importer ses modules
      - name: Check imports
        working-directory: ./saham-bank-backend
        run: python -c "from etl.bronze.extract_bronze import BronzeExtractor; print('Imports OK')"

  # Job 2 : Vérifier le frontend
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Lint check
        run: npx tsc --noEmit  # Vérifie TypeScript (si tu utilises TS)

  # Job 3 : Build Docker (simulation)
  docker-build:
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]  # Attend que les tests passent
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t saham-backend ./saham-bank-backend

  # (Optionnel) Déploiement
  deploy:
    runs-on: ubuntu-latest
    needs: [docker-build]
    if: github.ref == 'refs/heads/main'  # Seulement sur main
    steps:
      - name: Deploy to production
        run: echo "ICI : docker push + ssh deploy"
```

---

## Étape 3 : Pousser sur GitHub

```bash
# 1. Initialise git (déjà fait normalement)
git init

# 2. Ajoute tout
git add .

# 3. Premier commit
git commit -m "Initial commit: Saham Bank Analytics Portal"

# 4. Connecte à ton repo GitHub
git remote add origin https://github.com/TON_USER/saham-bank-analytics-portal.git

# 5. Pousse
git push -u origin main
```

---

## Étape 4 : Vérifier que le CI s'exécute

1. Va sur `github.com/TON_USER/saham-bank-analytics-portal`
2. Clique sur l'onglet **"Actions"**
3. Tu devrais voir ton workflow "CI Saham Bank" en cours
4. Clique dessus pour voir les logs en temps réel
5. ✅ Verts = succès ❌ Rouges = erreur

---

## Étape 5 : Ajouter un badge "status" dans le README

Dans `README.md`, ajoute en haut :

```markdown
# Saham Bank Analytics Portal

![CI](https://github.com/TON_USER/saham-bank-analytics-portal/actions/workflows/ci.yml/badge.svg)
```

> Ce badge montre en temps réel si le CI passe ou non.

---

## Structure finale du repo

```
saham-bank-analytics-portal/
├── .github/
│   └── workflows/
│       └── ci.yml              ← Workflow GitHub Actions
├── saham-bank-backend/
│   ├── app/
│   ├── etl/
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml
├── index.html                   ← Frontend SPA
├── ECRITURES/                   ← Documentation
└── README.md
```

---

## Commandes Git utiles pour le CI/CD

```bash
# Voir l'état
git status

# Voir les fichiers modifiés
git diff

# Ajouter seulement certains fichiers
git add .github/workflows/ci.yml

# Commit avec message
git commit -m "feat: add CI workflow"

# Pousser
git push
```

---

## Et après ?

Passe à `GUIDE_AIRFLOW_ETL.md` pour orchestrer l'ETL avec Airflow.
