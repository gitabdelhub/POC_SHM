# Architecture du Chatbot IA (Text-to-SQL & Generative UI)

Ce document décrit l'architecture cible pour le chatbot intelligent du portail Saham Bank, tel que discuté pour le projet de stage Data Engineering.

## 1. Le concept : Text-to-SQL + Generative UI
Le chatbot ne se contente pas de répondre textuellement. Il agit comme un analyste de données autonome :
1. Il comprend la question métier.
2. Il génère la requête SQL appropriée.
3. Il exécute la requête sur la base de données.
4. Il décide du meilleur format de restitution (Texte, Tableau, ou Graphique).
5. Il explique les résultats de manière vulgarisée.

## 2. Pipeline Technique (Backend / Data Engineering)

L'approche recommandée est d'utiliser un framework comme **LangChain** ou **LlamaIndex** couplé à un LLM (ex: GPT-4, Claude, ou un modèle open-source hébergé).

### Étape A : Traduction (Text to SQL)
- **Prompting & Contexte** : Le LLM reçoit le schéma des tables de la couche **Gold** (uniquement les tables agrégées, pour la performance et la sécurité).
- **RAG for SQL** : Pour éviter les hallucinations, on injecte dans le prompt un dictionnaire de données et des exemples de requêtes SQL valides (Few-Shot Prompting).
- **Génération** : Le LLM produit une requête SQL dialect-specific (ex: PostgreSQL).

### Étape B : Exécution & Sécurité
- Le backend intercepte le SQL généré.
- **Sécurité Critique** : La requête est exécutée via un utilisateur base de données en **Lecture Seule (Read-Only)** avec des droits restreints aux vues autorisées (Row-Level Security).

### Étape C : Restitution (Generative UI & Graphiques)
- Le backend récupère les données (ex: `[{annee: 2012, CA: 100}, {annee: 2013, CA: 110}]`).
- Le LLM est rappelé avec ces données pour générer un **objet JSON structuré** (Structured Output) au lieu d'un simple texte.
- Exemple de payload renvoyé au Frontend (React) :
  ```json
  {
    "explanation": "Le chiffre d'affaires a connu une croissance constante depuis 2012, avec une accélération marquée après 2020.",
    "visual_type": "line_chart",
    "data": {
      "labels": ["2012", "2013", "...", "2026"],
      "datasets": [{"label": "CA (M MAD)", "values": [100, 110, 150]}]
    }
  }
  ```

## 3. Intégration Frontend (React)
- Le frontend React parse ce JSON.
- Si `visual_type` est `line_chart`, il utilise une librairie comme **Chart.js** ou **Recharts** pour dessiner le graphique dynamiquement dans la bulle de chat.
- **Fonctionnalité d'export** : Un bouton "Télécharger" utilise des librairies frontend (ex: `html2canvas` ou les API natives des librairies de chart) pour exporter le `<canvas>` en image (PNG) ou PDF.

## 4. Points de valorisation pour la soutenance (Jury)
Lors de la présentation, les étudiants devront insister sur :
- **L'isolation des couches** : Le LLM ne tape jamais dans la base de production (Bronze), mais uniquement dans les Data Marts optimisés (Gold).
- **La gestion des hallucinations** : Que se passe-t-il si l'utilisateur demande une donnée qui n'existe pas ? (Implémentation de garde-fous / Guardrails).
- **L'expérience utilisateur (UX)** : La "Generative UI" (générer des composants graphiques à la volée plutôt que du texte brut) est la pointe de la technologie en IA moderne.
