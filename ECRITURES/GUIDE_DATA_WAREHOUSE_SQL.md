# Guide Data Warehouse — PostgreSQL (SQL)

> Construis le warehouse Gold toi-même en SQL, étape par étape

---

## Étape 1 : Ouvrir PostgreSQL

**Si tu as pgAdmin (interface graphique) :**
1. Ouvre pgAdmin
2. Connecte-toi avec ton mot de passe PostgreSQL
3. Clique droit sur "Databases" → "Create" → "Database"
4. Nomme-la : `saham_bank_warehouse`
5. Clique droit sur ta base → "Query Tool"

**Si tu préfères psql (terminal) :**
```bash
# Ouvre un terminal
psql -U postgres
# Crée la base
CREATE DATABASE saham_bank_warehouse;
# Connecte-toi
\c saham_bank_warehouse
```

---

## Étape 2 : Créer le fichier SQL

Dans le dossier `saham-bank-backend/etl/sql/`, crée un fichier `create_warehouse.sql`.

> **Où créer le fichier :**
> - Va dans le dossier `etl/` de l'ide
> - Crée un dossier `sql/` s'il n'existe pas
> - Crée `create_warehouse.sql`

---

## Étape 3 : Créer les dimensions (écris ces requêtes)

### 3.1 dim_date

Copie ce SQL dans ton fichier :

```sql
-- Supprime si existe déjà (idempotent)
DROP TABLE IF EXISTS dim_date CASCADE;

CREATE TABLE dim_date (
    date_id VARCHAR(20) PRIMARY KEY,  -- ex: "20260101"
    annee INTEGER NOT NULL,
    mois INTEGER NOT NULL,
    mois_libelle VARCHAR(20),
    annee_mois VARCHAR(10),           -- ex: "2026-01"
    trimestre INTEGER,
    semestre INTEGER
);

-- Insère les données
INSERT INTO dim_date (date_id, annee, mois, mois_libelle, annee_mois, trimestre, semestre)
VALUES
('20210101', 2021, 1, 'Janvier', '2021-01', 1, 1),
('20210201', 2021, 2, 'Février', '2021-02', 1, 1);
-- ... continue jusqu'à aujourd'hui
```

> **Travail à faire :** Ajoute les 60 mois manquants (2021-01 à 2026-12). Utilise `generate_series` si tu veux être efficace :
> ```sql
> INSERT INTO dim_date (date_id, annee, mois, mois_libelle, annee_mois, trimestre, semestre)
> SELECT 
>     to_char(d, 'YYYYMM') || '01',
>     EXTRACT(YEAR FROM d)::int,
>     EXTRACT(MONTH FROM d)::int,
>     to_char(d, 'TMMonth'),
>     to_char(d, 'YYYY-MM'),
>     EXTRACT(QUARTER FROM d)::int,
>     CASE WHEN EXTRACT(MONTH FROM d) <= 6 THEN 1 ELSE 2 END
> FROM generate_series('2021-01-01'::date, '2026-12-01'::date, '1 month') AS d;
> ```

### 3.2 dim_agence

```sql
DROP TABLE IF EXISTS dim_agence CASCADE;

CREATE TABLE dim_agence (
    agence_id VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(100),
    ville VARCHAR(50),
    region VARCHAR(50),
    directeur VARCHAR(100),
    directeur_regional VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    date_ouverture DATE
);
```

> **Travail à faire :** Insère les agences. Tu peux les générer depuis Python ou les écrire à la main.

### 3.3 dim_client

```sql
DROP TABLE IF EXISTS dim_client CASCADE;

CREATE TABLE dim_client (
    client_id VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(100),
    segment VARCHAR(50),
    age INTEGER,
    date_naissance DATE,
    email VARCHAR(100),
    telephone VARCHAR(20),
    agence_id VARCHAR(50) REFERENCES dim_agence(agence_id),
    ville VARCHAR(50),
    encours_actuel DECIMAL(15,2),
    score_actuel INTEGER,
    statut_actuel VARCHAR(50)
);

CREATE INDEX idx_dim_client_agence ON dim_client(agence_id);
CREATE INDEX idx_dim_client_segment ON dim_client(segment);
```

### 3.4 dim_type_credit

```sql
DROP TABLE IF EXISTS dim_type_credit CASCADE;

CREATE TABLE dim_type_credit (
    type_credit_id VARCHAR(50) PRIMARY KEY,
    libelle VARCHAR(100),
    famille VARCHAR(50)
);

INSERT INTO dim_type_credit VALUES
('Mourabaha Immo', 'Mourabaha Immobilier', 'Immobilier'),
('Ijara', 'Ijara', 'Immobilier'),
('Mourabaha Auto', 'Mourabaha Automobile', 'Conso'),
('Credit Tresorerie', 'Crédit Trésorerie', 'Conso'),
('Investissement PME', 'Investissement PME', 'PME');
```

### 3.5 dim_utilisateur

```sql
DROP TABLE IF EXISTS dim_utilisateur CASCADE;

CREATE TABLE dim_utilisateur (
    user_id VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO dim_utilisateur VALUES
('USR-00001', 'Samira Hakim', 'samira.hakim@sahambank.ma', 'DR', true),
('USR-00002', 'Youssef Amrani', 'youssef.amrani@sahambank.ma', 'DG', true),
('USR-00003', 'Amina Bennani', 'amina.bennani@sahambank.ma', 'ADMIN', true);
```

---

## Étape 4 : Créer les fact tables

### 4.1 fact_engagement

```sql
DROP TABLE IF EXISTS fact_engagement CASCADE;

CREATE TABLE fact_engagement (
    engagement_id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) REFERENCES dim_client(client_id),
    type_credit_id VARCHAR(50) REFERENCES dim_type_credit(type_credit_id),
    agence_id VARCHAR(50) REFERENCES dim_agence(agence_id),
    montant DECIMAL(15,2),
    duree_mois INTEGER,
    taux DECIMAL(5,2),
    score INTEGER,
    statut VARCHAR(50),
    date_depot TIMESTAMP,
    date_decision TIMESTAMP,
    annee_mois_depot VARCHAR(10)
);

CREATE INDEX idx_fact_engagement_client ON fact_engagement(client_id);
CREATE INDEX idx_fact_engagement_type ON fact_engagement(type_credit_id);
CREATE INDEX idx_fact_engagement_statut ON fact_engagement(statut);
```

### 4.2 fact_performance

```sql
DROP TABLE IF EXISTS fact_performance CASCADE;

CREATE TABLE fact_performance (
    performance_id VARCHAR(100) PRIMARY KEY,
    agence_id VARCHAR(50) REFERENCES dim_agence(agence_id),
    date_id VARCHAR(20) REFERENCES dim_date(date_id),
    pnb DECIMAL(15,2),
    encours_credits DECIMAL(15,2),
    encours_depots DECIMAL(15,2),
    npl_ratio DECIMAL(5,2),
    nim DECIMAL(5,2),
    nombre_clients INTEGER,
    objectif_pnb DECIMAL(15,2),
    ratio_credits_depots DECIMAL(5,2)
);

CREATE INDEX idx_fact_perf_agence ON fact_performance(agence_id);
CREATE INDEX idx_fact_perf_date ON fact_performance(date_id);
```

### 4.3 fact_qualite

```sql
DROP TABLE IF EXISTS fact_qualite CASCADE;

CREATE TABLE fact_qualite (
    qualite_id VARCHAR(100) PRIMARY KEY,
    agence_id VARCHAR(50) REFERENCES dim_agence(agence_id),
    date_id VARCHAR(20) REFERENCES dim_date(date_id),
    nps INTEGER CHECK (nps BETWEEN -100 AND 100),
    reclamations_ouvertes INTEGER,
    reclamations_traitees INTEGER,
    delai_resolution_moyen DECIMAL(4,1),
    taux_traitement DECIMAL(5,2)
);
```

### 4.4 fact_risque

```sql
DROP TABLE IF EXISTS fact_risque CASCADE;

CREATE TABLE fact_risque (
    risque_id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(50) REFERENCES dim_client(client_id),
    date_id VARCHAR(20) REFERENCES dim_date(date_id),
    score_risque INTEGER CHECK (score_risque BETWEEN 0 AND 100),
    classe_risque VARCHAR(5) CHECK (classe_risque IN ('A', 'B', 'C', 'D')),
    classe_libelle VARCHAR(50),
    npl_flag BOOLEAN DEFAULT FALSE,
    transition_from VARCHAR(5),
    transition_to VARCHAR(5),
    agence_id VARCHAR(50) REFERENCES dim_agence(agence_id)
);
```

---

## Étape 5 : Exécuter le fichier SQL

**Avec pgAdmin :**
1. Ouvre le Query Tool
2. File → Open → choisis `create_warehouse.sql`
3. Clique "Execute" (⏵)

**Avec psql :**
```bash
psql -U postgres -d saham_bank_warehouse -f etl/sql/create_warehouse.sql
```

**Vérifie que tout est créé :**
```sql
-- Liste toutes tes tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Devrait afficher : dim_agence, dim_client, dim_date, dim_type_credit, dim_utilisateur, fact_engagement, fact_performance, fact_qualite, fact_risque
```

---

## Étape 6 : Ajouter des données de test

```sql
-- Compter les lignes par table
SELECT 'dim_date' as tbl, count(*) FROM dim_date
UNION ALL
SELECT 'dim_agence', count(*) FROM dim_agence
UNION ALL
SELECT 'dim_client', count(*) FROM dim_client
UNION ALL
SELECT 'fact_engagement', count(*) FROM fact_engagement;

-- Voir une vue d'ensemble
SELECT 
    c.client_id, c.nom, c.segment,
    e.engagement_id, e.montant, e.statut,
    a.nom as agence
FROM dim_client c
JOIN fact_engagement e ON c.client_id = e.client_id
JOIN dim_agence a ON c.agence_id = a.agence_id
LIMIT 20;
```

---

## Étape 7 : Rendre le tout réexécutable (idempotent)

Pour pouvoir relancer le script sans erreur, on utilise `DROP TABLE IF EXISTS` avant chaque `CREATE TABLE`, et `ON CONFLICT` pour les insertions :

```sql
-- Exemple d'insertion idempotente
INSERT INTO dim_type_credit (type_credit_id, libelle, famille) 
VALUES ('Mourabaha Immo', 'Mourabaha Immobilier', 'Immobilier')
ON CONFLICT (type_credit_id) DO NOTHING;
```

> ✅ **Règle d'or :** Tu dois pouvoir exécuter le script 1 fois, 2 fois, 10 fois → résultat identique.

---

## Et après ?

Une fois le warehouse créé :
1. Génère les données avec `python etl/generate_data.py`
2. Lance l'ETL complet : `python etl/etl_pipeline.py`
3. Vérifie que les données sont dans PostgreSQL
4. Le frontend pourra requêter via l'API FastAPI

**Prochaine étape :** `GUIDE_DOCKER.md` pour containeriser tout ça.
