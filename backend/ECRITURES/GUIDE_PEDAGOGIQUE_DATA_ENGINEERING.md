# Guide Pédagogique - Data Engineering pour Saham Bank
## Pour Comprendre et Construire les Pipelines de Données

**Objectif :** À la fin de ce guide, tu pourras :
- Comprendre les concepts fondamentaux du Data Engineering
- Comprendre Medallion Architecture (Bronze/Silver/Gold)
- Générer des données réalistes avec Faker (Saham Bank)
- Construire des pipelines ETL simples (Scripts Python)
- Comprendre Batch vs Incremental Loading
- Peupler une base de données PostgreSQL
- Comprendre le flux de données de bout en bout

---

## Table des Matières

1. [Qu'est-ce que le Data Engineering ?](#1-quest-ce-que-le-data-engineering)
2. [Concepts Fondamentaux](#2-concepts-fondamentaux)
3. [Medallion Architecture](#3-medallion-architecture)
4. [Batch vs Incremental Loading](#4-batch-vs-incremental-loading)
5. [Faker pour Saham Bank](#5-faker-pour-saham-bank)
6. [Pourquoi ce projet est un bon point de départ](#6-pourquoi-ce-projet-est-un-bon-point-de-départ)
7. [Par où commencer ?](#7-par-où-commencer)
8. [Étapes de Construction](#8-étapes-de-construction)
9. [Outils et Technologies](#9-outils-et-technologies)

---

## 1. Qu'est-ce que le Data Engineering ?

### Définition Simple

Le Data Engineering est la discipline qui consiste à :
- **Collecter** des données depuis différentes sources
- **Transformer** ces données pour les rendre utilisables
- **Charger** ces données dans un système de stockage
- **Maintenir** les pipelines de données

### Analogie de l'usine

```
Données brutes = Matières premières (minerais, pétrole, etc.)
Data Engineer = Ingénieur de l'usine
Pipeline ETL = Chaîne de production
Base de données = Entrepôt de produits finis
Data Scientist = Analyste qui utilise les produits finis
```

### Pourquoi le Data Engineering est important ?

**Sans Data Engineer :**
- Les données sont dispersées (Excel, CSV, APIs, logs)
- Les données sont incohérentes (formats différents)
- Les données sont inaccessibles (pas centralisées)
- Les Data Scientists perdent 80% de leur temps à nettoyer les données

**Avec Data Engineer :**
- Les données sont centralisées (Data Warehouse)
- Les données sont cohérentes (format standardisé)
- Les données sont accessibles (via SQL ou API)
- Les Data Scientists se concentrent sur l'analyse

---

## 2. Concepts Fondamentaux

### ETL vs ELT

| Concept | Signification | Ordre | Avantages | Inconvénients |
|---------|---------------|-------|-----------|---------------|
| **ETL** | Extract, Transform, Load | Extract → Transform → Load | Données transformées avant chargement | Plus lent, transformation limitée |
| **ELT** | Extract, Load, Transform | Extract → Load → Transform | Plus rapide, transformation dans la DB | DB doit être puissante |

**Pourquoi ELT est moderne (2026) :**
- Les bases de données modernes (PostgreSQL, Snowflake, BigQuery) sont très puissantes
- Transformation dans la DB est plus efficace
- Données brutes disponibles pour analyses futures

**Pour ce projet :** On utilise ELT
1. **Extract** : Générer des données avec Faker
2. **Load** : Insérer dans PostgreSQL
3. **Transform** : Requêtes SQL pour KPIs, dashboard

---

### Data Warehouse vs Data Lake

| Concept | Description | Exemple |
|---------|-------------|---------|
| **Data Warehouse** | Données structurées, optimisées pour requêtes | PostgreSQL, Snowflake |
| **Data Lake** | Données brutes (structurées et non-structurées) | S3, Azure Blob Storage |

**Pour ce projet :** Data Warehouse (PostgreSQL)
- Données structurées (tables relationnelles)
- Optimisées pour requêtes SQL
- Suffisant pour un POC bancaire

---

### Seed Data vs Production Data

| Concept | Description | Usage |
|---------|-------------|-------|
| **Seed Data** | Données générées pour développement/tests | Faker, scripts de génération |
| **Production Data** | Données réelles des clients | APIs, fichiers, streams |

**Pour ce projet :** Seed Data (Faker)
- Pas de données réelles disponibles
- Besoin de données réalistes pour tester
- Faker permet de générer des données cohérentes

---

## 3. Medallion Architecture

### Qu'est-ce que Medallion Architecture ?

Medallion Architecture est une approche standard dans l'industrie pour organiser les données en 3 couches progressivement raffinées :

```
┌─────────────────────────────────────────────────────────┐
│                    Bronze Layer (Raw)                   │
│  Données brutes depuis Faker (ingestion sans transformation) │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Silver Layer (Cleaned)                 │
│  Données nettoyées, validées, standardisées              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Gold Layer (Curated)                   │
│  Données agrégées, modélisées (dim/fact tables)          │
└─────────────────────────────────────────────────────────┘
```

### Pourquoi Medallion Architecture ?

| Couche | Objectif | Transformation | Usage |
|--------|----------|----------------|-------|
| **Bronze** | Ingestion brute | Aucune | Audit, traçabilité |
| **Silver** | Nettoyage | Validation, standardisation | Data quality |
| **Gold** | Business ready | Agrégations, modeling | Dashboard, IA |

### Bronze Layer (Raw Data)

**Objectif :** Ingestion des données brutes depuis Faker sans transformation

**Tables :**
- `bronze_users` : Données brutes utilisateurs
- `bronze_clients` : Données brutes clients
- `bronze_engagements` : Données brutes engagements
- `bronze_agences` : Données brutes agences

**Caractéristiques :**
- Structure définie par le format Faker
- Pas de transformation
- Historisation complète
- Pour audit et traçabilité

**Exemple :**
```python
# Bronze : Données exactement comme générées par Faker
bronze_client = {
    "id": "CLI-10001",
    "nom": "Rachid Benali",
    "segment": "Particuliers",
    "agence": "Casablanca Anfa",
    "encours": 150000,
    "score": 75,
    "statut": "Actif"
}
```

### Silver Layer (Cleaned Data)

**Objectif :** Nettoyage, validation, standardisation des données

**Tables :**
- `silver_users` : Utilisateurs nettoyés
- `silver_clients` : Clients nettoyés
- `silver_engagements` : Engagements nettoyés
- `silver_agences` : Agences nettoyées

**Caractéristiques :**
- Structure similaire à Bronze
- Colonnes techniques ajoutées (`is_valid`, `error_message`, `ingested_at`)
- Règles de qualité appliquées
- Dédoublonnage

**Exemple :**
```python
# Silver : Données nettoyées avec colonnes techniques
silver_client = {
    "id": "CLI-10001",
    "nom": "Rachid Benali",
    "segment": "Particuliers",
    "agence": "Casablanca Anfa",
    "encours": 150000,
    "score": 75,
    "statut": "Actif",
    "is_valid": True,
    "error_message": None,
    "ingested_at": "2026-07-15T10:30:00"
}
```

### Gold Layer (Curated Data)

**Objectif :** Data modeling, agrégations, KPIs pour dashboard et IA

**Tables (Data modeling par stagiaire) :**
- `dim_clients` : Dimension clients
- `dim_agences` : Dimension agences
- `fact_engagements` : Fact table engagements
- `fact_kpis` : Fact table KPIs agrégés

**Caractéristiques :**
- Modélisation dimensionnelle (star schema)
- Agrégations pour dashboard
- Optimisé pour requêtes
- Cible du Text-to-SQL (IA)

**Exemple :**
```python
# Gold : Données agrégées pour dashboard
fact_kpi = {
    "mois": "2026-07",
    "agence_id": "AG-001",
    "segment": "Particuliers",
    "total_encours": 5000000,
    "nombre_clients": 150,
    "score_moyen": 72
}
```

### Pourquoi Medallion Architecture pour ce projet ?

✅ **Standard industrie** → Compétence recherchée  
✅ **Flexibilité** → Facile à adapter aux changements  
✅ **Data quality** → Validation à chaque couche  
✅ **Audit trail** → Traçabilité complète  
✅ **Scalable** → Prêt pour données réelles  

---

## 4. Batch vs Incremental Loading

### Batch Loading (Chargement par lot)

**Quoi :** Recharger TOUTES les données périodiquement

**Quand :** Chaque nuit, chaque semaine

**Exemple :**
```sql
-- Batch Loading : Rechargement complet
DELETE FROM bronze_clients;
INSERT INTO bronze_clients SELECT * FROM source_clients;
```

**Avantages :**
- Simple à implémenter
- Données cohérentes (snapshot)
- Pas de tracking des changements

**Inconvénients :**
- Lent pour gros volumes
- Gaspille de ressources
- Pas temps réel

**Pour ce projet :** Batch Loading
- Volume modéré (quelques milliers de lignes)
- Données mises à jour quotidiennement
- Plus simple pour un stage

### Incremental Loading (Chargement incrémental)

**Quoi :** Ne charger que les NOUVELLES/MODIFIÉES données

**Quand :** En temps réel ou quasi-temps réel

**Exemple :**
```sql
-- Incremental Loading : Que les nouvelles/modifiées
INSERT INTO bronze_clients 
SELECT * FROM source_clients 
WHERE updated_at > last_run;
```

**Avantages :**
- Rapide
- Économique en ressources
- Temps réel possible

**Inconvénients :**
- Complexité (tracking des changements)
- Détection des deletes difficile
- Plus complexe à implémenter

### Flexibilité pour passer de Batch à Incremental

**Design pour supporter les deux :**
- Tables avec `updated_at` pour tracking futur
- Scripts modulaires (facile à modifier)
- Infrastructure prête

**Quand passer à Incremental :**
- Volume > 10M lignes
- Besoin temps réel
- Coût batch trop élevé

### Pourquoi Batch Loading pour ce projet ?

✅ **Simple** → Adapté à un stage  
✅ **Volume modéré** → Pas de problème de performance  
✅ **Flexible** → Prêt pour incremental futur  
✅ **Données cohérentes** → Snapshot à instant T  

---

## 5. Faker pour Saham Bank

### Qu'est-ce que Faker ?

Faker est une bibliothèque Python qui génère des données factices mais réalistes.

**Faker N'EST PAS une IA :**
- Faker choisit aléatoirement dans des listes prédéfinies
- Tu dois définir les listes de données réalistes
- C'est TON travail de définir les données bancaires marocaines

### Comment fonctionne Faker ?

**Step 1 : TU définis les listes de données réalistes**

```python
# C'est TON travail de définir ces listes
segments_bancaires = [
    "Particuliers",
    "Professionnels",
    "PME",
    "Grandes Entreprises",
    "Bancassurance"
]

types_credit = [
    "Mourabaha Immo",
    "Ijara",
    "Mourabaha Auto",
    "Crédit Tréso",
    "Investissement PME"
]

villes_maroc = [
    "Casablanca",
    "Rabat",
    "Marrakech",
    "Fès",
    "Tanger",
    "Agadir",
    "Meknès",
    "Oujda",
    "Kénitra",
    "Tétouan"
]
```

**Step 2 : TU crées un custom provider**

```python
from faker import Faker
from faker.providers import BaseProvider
import random

class MoroccanBankingProvider(BaseProvider):
    def segment_bancaire(self):
        return random.choice(segments_bancaires)
    
    def type_credit(self):
        return random.choice(types_credit)
    
    def ville_maroc(self):
        return random.choice(villes_maroc)
```

**Step 3 : Faker utilise TES listes**

```python
fake = Faker()
fake.add_provider(MoroccanBankingProvider)

# Faker choisit aléatoirement dans TES listes
print(fake.segment_bancaire())  # "PME"
print(fake.type_credit())       # "Mourabaha Immo"
print(fake.ville_maroc())       # "Casablanca"
```

### Données Saham Bank à définir

**Agences (8 agences) :**
- Casablanca Anfa
- Casablanca Maarif
- Rabat Agdal
- Rabat Hassan
- Marrakech Gueliz
- Agadir Centre
- Fès Ville Nouvelle
- Tanger Marina

**Segments bancaires (5 segments) :**
- Particuliers
- Professionnels
- PME
- Grandes Entreprises
- Bancassurance

**Types de crédit (5 types) :**
- Mourabaha Immo
- Ijara
- Mourabaha Auto
- Crédit Tréso
- Investissement PME

**Rôles utilisateurs (5 rôles) :**
- DG (Directeur Général)
- DR (Directeur Régional)
- CA (Chargé d'Affaires)
- AR (Analyste Risque)
- Admin

**Statuts dossier (5 statuts) :**
- En analyse
- Validé
- Débloqué
- Surveillance
- Contentieux

**Statuts client (3 statuts) :**
- Actif
- À risque
- Défaut

**Noms marocains (15 prénoms) :**
- Rachid, Fatima, Youssef, Khadija, Omar, Amina, Mehdi, Laila, Hassan, Sanae, Karim, Nadia, Adil, Mouna, Tarik

**Noms de famille marocains (15 noms) :**
- Benali, El Idrissi, Amrani, Tazi, Berrada, Bennani, Chraibi, Mansour, El Fassi, Alaoui, Tahiri, Zniber, Filali, El Ouardi, Kabbaj

### Pourquoi Faker pour ce projet ?

✅ **Données réalistes** → Test professionnel  
✅ **Flexible** → Facile à adapter  
✅ **Pas de données réelles** → Respect confidentialité  
✅ **Compétence utile** → Génération de données test  

---

## 6. Pourquoi ce projet est un bon point de départ

### Compétences développées

1. **Python pour la Data**
   - Utilisation de Faker pour générer des données
   - Manipulation de données avec pandas (optionnel)
   - Scripts Python pour automatiser les pipelines

2. **SQL Avancé**
   - Création de tables PostgreSQL
   - Insertion de données en masse
   - Requêtes complexes (JOIN, GROUP BY, WINDOW functions)

3. **Compréhension des données métier**
   - Données bancaires (clients, engagements, agences)
   - Relations entre entités
   - Contraintes business (scores, segments)

4. **Pipeline ETL/ELT**
   - Génération de données (Extract)
   - Chargement dans PostgreSQL (Load)
   - Transformation via SQL (Transform)

### Ce projet N'EST PAS

- Un projet Big Data (pas besoin de Spark, Hadoop)
- Un projet Real-time (pas besoin de Kafka, Flink)
- Un projet Machine Learning (c'est pour après)

### Ce projet EST

- Un projet de Data Engineering fondamental
- Un point de départ solide pour apprendre
- Une base pour des projets plus complexes

---

## 7. Par où commencer ?

### Étape 1 : Comprendre les données métier

**Questions à se poser :**
- Quelles sont les entités principales ? (Users, Clients, Engagements, Agences)
- Quelles sont les relations entre elles ? (Engagement → Client, Client → Agence)
- Quelles sont les contraintes business ? (Score 0-100, segments spécifiques)

**Action :** Regarder le schéma de la base de données dans les modèles SQLAlchemy

---

### Étape 2 : Installer les outils

**Outils nécessaires :**
- Python (déjà installé)
- PostgreSQL (à installer)
- Faker (déjà installé via requirements.txt)

**Action :** Vérifier que PostgreSQL est installé et fonctionne

---

### Étape 3 : Générer les données avec Faker

**Concepts Faker :**
- **Provider** : Source de données (noms, adresses, entreprises)
- **Locale** : Adaptation locale (fr_FR pour données françaises)
- **Custom Provider** : Provider personnalisé pour données bancaires marocaines

**Action :** Créer des scripts dans `app/db_seed/`

---

### Étape 4 : Charger les données dans PostgreSQL

**Méthodes :**
- **SQLAlchemy ORM** : Insertion via objets Python (plus lent, plus simple)
- **SQL brut** : Insertion via `INSERT INTO` (plus rapide, plus complexe)
- **Bulk insert** : Insertion en masse (recommandé pour grandes quantités)

**Action :** Créer un script qui génère et insère les données

---

### Étape 5 : Valider les données

**Vérifications :**
- Les données sont-elles réalistes ? (noms, montants, dates)
- Les relations sont-elles cohérentes ? (client_id existe dans clients)
- Les contraintes sont-elles respectées ? (score 0-100)

**Action :** Requêtes SQL pour vérifier les données

---

## 8. Étapes de Construction

### Étape 1 : Créer un Provider Faker personnalisé (0.5j)

**Objectif :** Créer un provider pour données bancaires marocaines

**Concepts :**
- Hériter de `faker.providers.BaseProvider`
- Définir des méthodes pour générer des données spécifiques
- Utiliser des listes de valeurs réelles (segments, types de crédit)

**Fichier à créer :** `app/db_seed/moroccan_provider.py`

**Données à générer :**
- Segments bancaires (Particuliers, PME, Grandes Entreprises, etc.)
- Types de crédit (Mourabaha, Ijara, etc.)
- Villes marocaines
- Scores de risque (0-100)

---

### Étape 2 : Générer les Users (0.5j)

**Objectif :** Créer des utilisateurs avec différents rôles

**Concepts :**
- Utiliser Faker pour emails, noms
- Hasher les mots de passe avec bcrypt
- Assigner des rôles (DG, DR, CA, AR, Admin)

**Fichier à créer :** `app/db_seed/seed_users.py`

**Données à générer :**
- 1 Admin
- 1 DG
- 5 DR (Directeurs Régionaux)
- 20 CA (Chargés d'Affaires)
- 50 AR (Agents de Relation)

---

### Étape 3 : Générer les Agences (0.5j)

**Objectif :** Créer des agences bancaires

**Concepts :**
- Utiliser le provider marocain pour villes
- Générer des IDs uniques (AG-XXXXX)
- Assigner des directeurs

**Fichier à créer :** `app/db_seed/seed_agences.py`

**Données à générer :**
- 50 agences
- Réparties dans différentes villes marocaines
- Avec encours_total initial = 0

---

### Étape 4 : Générer les Clients (1j)

**Objectif :** Créer des clients bancaires

**Concepts :**
- Utiliser Faker pour noms, emails, téléphones
- Assigner des segments aléatoires
- Assigner des agences aléatoires
- Calculer des scores de risque réalistes
- Calculer des encours réalistes

**Fichier à créer :** `app/db_seed/seed_clients.py`

**Données à générer :**
- 1000 clients
- Segments : 60% Particuliers, 30% PME, 10% Grandes Entreprises
- Scores : distribution normale (moyenne 50, écart-type 15)
- Encours : selon segment (Particuliers: 10K-500K, PME: 500K-5M, GE: 5M-50M)

---

### Étape 5 : Générer les Engagements (1j)

**Objectif :** Créer des dossiers de crédit

**Concepts :**
- Lier chaque engagement à un client existant
- Générer des types de crédit aléatoires
- Calculer des montants réalistes selon segment
- Calculer des durées réalistes (12-120 mois)
- Assigner des scores cohérents avec le client

**Fichier à créer :** `app/db_seed/seed_engagements.py`

**Données à générer :**
- 2000 engagements (2 par client en moyenne)
- Types : Mourabaha, Ijara, Tawarruq, etc.
- Montants : selon segment du client
- Statuts : 70% Débloqué, 20% En cours, 10% À risque

---

### Étape 6 : Script principal (0.5j)

**Objectif :** Orchestrateur qui exécute tous les seeds

**Concepts :**
- Importer tous les scripts de seed
- Exécuter dans l'ordre (Users → Agences → Clients → Engagements)
- Gérer les erreurs
- Afficher les statistiques

**Fichier à créer :** `app/db_seed/seed_all.py`

---

## 9. Outils et Technologies

### Faker

**Qu'est-ce que Faker ?**
- Bibliothèque Python pour générer des données factices
- Providers pour différents types de données (noms, adresses, entreprises)
- Locale pour adaptation locale (fr_FR, ar_MA, etc.)

**Pourquoi Faker ?**
- Données réalistes pour développement
- Pas besoin de données réelles (GDPR)
- Rapide et facile à utiliser

**Documentation :** https://faker.readthedocs.io/

---

### PostgreSQL

**Qu'est-ce que PostgreSQL ?**
- Base de données relationnelle open-source
- Très puissante et extensible
- Standard dans l'industrie

**Pourquoi PostgreSQL ?**
- Supporte des types avancés (JSON, ARRAY, GEOMETRY)
- Extensible (pgvector pour IA)
- Compatible avec SQLAlchemy

**Documentation :** https://www.postgresql.org/docs/

---

### SQLAlchemy

**Qu'est-ce que SQLAlchemy ?**
- ORM Python pour bases de données relationnelles
- Mapping objet-relationnel
- Compatible avec PostgreSQL, MySQL, SQLite, etc.

**Pourquoi SQLAlchemy ?**
- Type safety
- Abstraction SQL
- Compatible avec FastAPI

**Documentation :** https://docs.sqlalchemy.org/

---

## Ressources d'Apprentissage

### Data Engineering
- "Fundamentals of Data Engineering" (livre)
- "Designing Data-Intensive Applications" (livre)
- Coursera : "Data Engineering Foundations"

### Python pour la Data
- "Python for Data Analysis" (livre)
- Documentation pandas : https://pandas.pydata.org/

### SQL
- "SQL for Data Scientists" (livre)
- Mode Analytics SQL Tutorial : https://mode.com/sql-tutorial/

---

## Conclusion

Ce projet de Data Engineering est un excellent point de départ car :
- Il couvre les concepts fondamentaux (ETL/ELT, Seed Data)
- Il utilise des technologies modernes (PostgreSQL, SQLAlchemy, Faker)
- Il est réaliste (données bancaires)
- Il est scalable (peut être étendu à des données réelles)

Les compétences que tu développes ici sont directement transférables à des projets plus complexes (Big Data, Real-time, ML Pipelines).

**Tu n'es pas en train de devenir Data Scientist, tu es en train de devenir Data Engineer.**
