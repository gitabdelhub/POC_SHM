# Guide Airflow — Orchestration ETL

> Guide pas à pas : tu codes, je t'explique ce qu'il faut faire.

---

## Prérequis

- Docker Desktop installé (cf. `GUIDE_DOCKER.md`)
- PostgreSQL qui tourne dans Docker
- Les fichiers de l'ETL prêts (couches Bronze, Silver, Gold)

---

## Étape 1 : Comprendre le rôle d'Airflow

Airflow sert à :
- **Planifier** : lancer l'ETL tous les jours à 8h
- **Ordonnancer** : Gold attend que Silver finisse, Silver attend Bronze
- **Surveiller** : logs, alertes si une tâche échoue
- **Relancer** : bouton "Retry" si une tâche plante

**Sans Airflow** → tu lances `python etl_pipeline.py` à la main
**Avec Airflow** → ça tourne tout seul

---

## Étape 2 : Créer le dossier Airflow

Dans `saham-bank-backend/`, crée :

```
saham-bank-backend/
├── airflow/
│   ├── Dockerfile          ← À créer
│   ├── dags/
│   │   └── etl_saham.py    ← À créer (le DAG)
│   └── requirements.txt    ← À créer
└── ...
```

> **À faire :** Crée ces fichiers dans ton IDE. Tu les remplis étape par étape.

---

## Étape 3 : Créer le Dockerfile Airflow

Crée `saham-bank-backend/airflow/Dockerfile` :

```dockerfile
FROM apache/airflow:2.9.1-python3.12

# Copie le dossier etl pour que les DAGs puissent l'importer
COPY ./etl /opt/airflow/etl
COPY ./app /opt/airflow/app

# Dépendances Python supplémentaires
COPY ./airflow/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```

**Ce qu'il fait :**
- `FROM apache/airflow:2.9.1` → image officielle Airflow
- `COPY ./etl` → rend l'ETL accessible aux DAGs
- `RUN pip install` → installe les dépendances

---

## Étape 4 : Créer requirements.txt pour Airflow

Crée `saham-bank-backend/airflow/requirements.txt` :

```
# Déjà dans l'image Airflow : apache-airflow, sqlalchemy, etc.
# On ajoute seulement ce qui manque :
psycopg2-binary
python-dotenv
```

---

## Étape 5 : Créer le DAG — partie 1 : les imports et paramètres

Ouvre `saham-bank-backend/airflow/dags/etl_saham.py` et écris :

```python
"""
DAG ETL Saham Bank — Bronze → Silver → Gold
Execute le pipeline complet de maniere idempotente
"""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
```

**Explique ton code :** Pourquoi ces imports ?

---

## Étape 6 : Définir les arguments par défaut

Ajoute en dessous :

```python
default_args = {
    'owner': 'saham_bank',
    'depends_on_past': False,
    'email_on_failure': True,
    'email': ['data@sahambank.ma'],
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}
```

- `owner` : ton équipe
- `retries` : si une tâche échoue, Airflow la relance 1 fois
- `retry_delay` : attend 5 minutes avant de relancer

---

## Étape 7 : Définir les fonctions Python de chaque étape

```python
def extract_bronze(**kwargs):
    from etl.bronze.extract_bronze import BronzeExtractor
    from etl.bronze.load_bronze import BronzeLoader
    
    extractor = BronzeExtractor()
    loader = BronzeLoader()
    
    data = extractor.extract_all()
    loader.create_tables()
    counts = loader.load_all(data)
    
    # Pousse les compteurs dans XCom (système de partage Airflow)
    kwargs['ti'].xcom_push(key='bronze_counts', value=counts)
    
    print(f"Bronze charge : {counts}")
    return counts


def transform_silver(**kwargs):
    from etl.silver.transform_silver import SilverTransformer
    from etl.bronze.extract_bronze import BronzeExtractor
    
    extractor = BronzeExtractor()
    transformer = SilverTransformer()
    
    bronze_data = extractor.extract_all()
    silver_data = transformer.transform_all(bronze_data)
    
    kwargs['ti'].xcom_push(key='silver_data', value=silver_data)
    
    valides = sum(1 for r in silver_data.get('clients', []) if r['is_valid'])
    print(f"Silver : {valides} clients valides")
    return valides


def load_silver(**kwargs):
    from etl.silver.load_silver import SilverLoader
    
    ti = kwargs['ti']
    silver_data = ti.xcom_pull(key='silver_data', task_ids='transform_silver')
    
    loader = SilverLoader()
    loader.create_tables()
    counts = loader.load_all(silver_data)
    
    print(f"Silver charge : {counts}")
    return counts


def build_gold(**kwargs):
    from etl.gold.transform_gold import GoldTransformer
    from etl.gold.load_gold import GoldLoader
    from etl.bronze.extract_bronze import BronzeExtractor
    from etl.silver.transform_silver import SilverTransformer
    
    extractor = BronzeExtractor()
    transformer = SilverTransformer()
    gold_transformer = GoldTransformer()
    gold_loader = GoldLoader()
    
    bronze_data = extractor.extract_all()
    silver_data = transformer.transform_all(bronze_data)
    gold_data = gold_transformer.transform_all(silver_data)
    
    gold_loader.create_tables()
    counts = gold_loader.load_all(gold_data)
    
    print(f"Gold charge : {counts}")
    return counts
```

**Ce que fait XCom :** C'est le système de stockage temporaire d'Airflow. Une tâche peut `xcom_push` une valeur, une autre peut `xcom_pull` pour la récupérer.

---

## Étape 8 : Créer le DAG (le graphe de tâches)

```python
with DAG(
    'saham_bank_etl',
    default_args=default_args,
    description='Pipeline ETL Bronze → Silver → Gold',
    schedule_interval='0 8 * * *',  # Tous les jours à 8h
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=['saham', 'etl'],
) as dag:
    
    t1 = PythonOperator(
        task_id='extract_bronze',
        python_callable=extract_bronze,
    )
    
    t2 = PythonOperator(
        task_id='transform_silver',
        python_callable=transform_silver,
    )
    
    t3 = PythonOperator(
        task_id='load_silver',
        python_callable=load_silver,
    )
    
    t4 = PythonOperator(
        task_id='build_gold',
        python_callable=build_gold,
    )
    
    # Ordre d'execution
    t1 >> t2 >> t3 >> t4
```

> **Le `schedule_interval='0 8 * * *'`** : format cron.
> - `0` = minute 0
> - `8` = 8h
> - `* * *` = tous les jours, tous les mois, tous les jours de la semaine

---

## Étape 9 : Ajouter Airflow au docker-compose.yml

Ouvre `docker-compose.yml` et ajoute un 3e service :

```yaml
  airflow:
    build:
      context: ./saham-bank-backend
      dockerfile: airflow/Dockerfile
    container_name: saham-airflow
    environment:
      AIRFLOW__CORE__EXECUTOR: LocalExecutor
      AIRFLOW__CORE__SQL_ALCHEMY_CONN: postgresql+psycopg2://saham_user:saham_pass_2026@postgres:5432/saham_bank
      AIRFLOW__CORE__FERNET_KEY: ''
      AIRFLOW__CORE__LOAD_EXAMPLES: 'False'
    ports:
      - "8080:8080"
    volumes:
      - ./saham-bank-backend/airflow/dags:/opt/airflow/dags
    command: >
      bash -c "
        airflow db init &&
        airflow users create --username admin --password admin --firstname Admin --lastname User --role Admin --email admin@saham.ma &&
        airflow webserver & airflow scheduler
      "
    depends_on:
      postgres:
        condition: service_healthy
```

> **Explication :**
> - `LocalExecutor` : exécute les tâches dans des sous-processus (simple)
> - `AIRFLOW__CORE__SQL_ALCHEMY_CONN` : Airflow utilise PostgreSQL pour stocker son état
> - `airflow db init` : crée les tables Airflow dans PostgreSQL
> - `airflow webserver & airflow scheduler` : lance l'interface web ET le planificateur

---

## Étape 10 : Lancer et tester

```bash
# 1. Rebuild avec le nouveau service Airflow
docker compose up --build -d

# 2. Vérifie que les 3 containers tournent
docker ps
# Attendu : saham-postgres, saham-backend, saham-airflow

# 3. Ouvre Airflow dans le navigateur
# Va à : http://localhost:8080
# Login : admin / Mot de passe : admin

# 4. Active le DAG
# Dans l'interface Airflow :
# - Cherche "saham_bank_etl" dans la liste
# - Clique sur le bouton ON/OFF pour l'activer
# - Clique sur "Trigger DAG" (▶) pour lancer manuellement

# 5. Vois les tâches s'exécuter
# - Clique sur le DAG
# - Tu vois les 4 tâches (t1 → t2 → t3 → t4)
# - Vert = succès, Rouge = erreur
```

---

## Étape 11 : Voir les logs

```bash
# Logs en temps réel
docker compose logs -f airflow

# Voir les fichiers DAGs
docker compose exec airflow ls /opt/airflow/dags/

# Lancer Airflow en mode debug
docker compose exec airflow airflow dags test saham_bank_etl 2026-01-01
```

---

## Résumé des concepts Airflow

| Concept | Rôle |
|---|---|
| **DAG** | Graphe orienté acyclique : définit l'ordre des tâches |
| **Operator** | Type de tâche : PythonOperator, BashOperator, PostgresOperator |
| **Task** | Une étape du pipeline (t1, t2, t3, t4) |
| **XCom** | Partage de données entre tâches |
| **Scheduler** | Le cœur qui vérifie si un DAG doit être exécuté |
| **Executor** | Comment les tâches sont exécutées (LocalExecutor = sur la même machine) |

---

## Et après ?

Tu as maintenant :
- ✅ PostgreSQL dans Docker
- ✅ API FastAPI dans Docker
- ✅ Airflow pour l'orchestration
- ✅ CI/CD sur GitHub

**Prochaine étape possible :** Créer les endpoints API REST pour servir les données Gold au frontend. Dis-moi quand tu es prêt(e) !
