# POC_SAHAM - Portail Analytique & Data Engineering

Bienvenue sur le Proof of Concept (POC) du **Portail Analytique de Saham Bank**, réalisé dans le cadre d'un stage de fin d'études / stage d'été en Data Engineering.

Ce dépôt contient l'interface frontend (POC) qui démontre les cas d'usage métiers : vision 360 des clients, rentabilité, suivi des commissions, cartographie des agences et l'assistant IA (Text-to-SQL).

## 🎯 Objectif du Stage
Transformer ce POC frontend en un **produit Data complet et robuste**. L'objectif est de concevoir et d'implémenter l'ensemble de la chaîne de valeur de la donnée (Data Pipeline), du backend jusqu'à la restitution, en appliquant les meilleures pratiques de l'ingénierie des données.

## 🏗️ Architecture Cible (Réalisation)

L'architecture globale du projet final se décompose en plusieurs couches :

### 1. Frontend (Ce POC)
- **Technologies** : React, Tailwind CSS, Chart.js, Leaflet (Cartographie).
- **Rôle** : Interface utilisateur, Data Visualization, intégration des rapports Power BI embarqués, et interface conversationnelle pour l'IA.

### 2. Backend & API
- **Technologies** : Spring Boot (Java), Spring Security, Spring Data JPA.
- **Rôle** : Sécurisation des endpoints, gestion des rôles (Directeurs, Agents, Admin), orchestration des requêtes vers la base de données et l'API d'IA.

### 3. Data Engineering & Architecture Médaillon (Data Lakehouse / Data Warehouse)
L'alimentation des tableaux de bord (Power BI / Frontend) et du Chatbot IA repose sur une architecture médaillon stricte :
- 🥉 **Bronze (Raw)** : Ingestion des données brutes depuis le Core Banking System (transactions, CRM, crédits). Historisation sans transformation.
- 🥈 **Silver (Cleansed & Conformed)** : Nettoyage, dédoublonnage, standardisation et jointures. Création d'un référentiel unique (ex: Référentiel Client, Référentiel Agence).
- 🥇 **Gold (Curated / Business)** : Modélisation dimensionnelle (Fait/Dimension, Modèle en étoile). Tables agrégées prêtes pour la BI (ex: `Fact_Commissions`, `Fact_Credit`, `Dim_Agence`) et l'IA (Text-to-SQL).
- **Outils** : Apache Airflow (Orchestration), dbt (Transformation), PostgreSQL / Snowflake / BigQuery (Stockage).

### 4. Intelligence Artificielle (Text-to-SQL)
- **Fonctionnement** : Le chatbot intercepte les questions en langage naturel, utilise un LLM (via LangChain / LlamaIndex) pour générer une requête SQL optimisée ciblant spécifiquement la couche **Gold**.
- **Sécurité** : Application de filtres (Row-Level Security) pour s'assurer qu'un directeur d'agence ne voit que les données de son agence.

### 5. CI/CD & DevOps
- **Pipeline** : GitHub Actions ou GitLab CI.
- **Étapes** : Linting, Tests unitaires (Data Tests via dbt), Build d'images Docker, et Déploiement continu.

## 🚀 Comment exécuter ce POC en local ?

1. Installez les dépendances :
   \`\`\`bash
   npm install
   \`\`\`
2. Lancez le serveur de développement :
   \`\`\`bash
   npm run dev
   \`\`\`
3. Ouvrez votre navigateur sur \`http://localhost:3000\`

## 👥 Équipe et Intervenants
- **Stagiaires Data Engineering** : Conception des pipelines de données, modélisation (Bronze/Silver/Gold), et implémentation du Text-to-SQL.
- **Encadrement** : Supervision de l'architecture, validation métier et technique.

---
*Ce POC a été généré et structuré pour servir de fondation au projet de stage.*
