# POC_SAHAM - Portail Analytique Saham Bank

Proof of Concept du portail analytique avec assistant IA (Text-to-SQL).

## 🚀 Lancement Rapide

```bash
# Installer les dépendances
npm install

# Lancer en local
npm run dev

# Build production
npm run build
```

Le site sera accessible sur http://localhost:3000

## 📁 Structure du Projet

```
POC_SAHAM/
├── index.html       # Fichier d'entrée principal
├── config/          # Configuration (package.json, vite.config.ts, etc.)
├── src/             # Code source principal (scripts)
├── patches/         # Scripts de patch/fix organisés par catégorie
├── data/            # Données géographiques (GeoJSON, SVG)
├── assets/          # Images et assets statiques
└── docs/            # Documentation
```

## 🔑 Configuration

Copiez `.env.example` et configurez votre clé API Gemini si vous voulez utiliser l'assistant IA.

## 📝 Modules

- **Pilotage Commercial** : Dashboard avec KPIs financiers
- **Espace Engagements** : Gestion des dossiers de crédit
- **Qualité Service** : Suivi des réclamations et NPS
- **Rentabilité** : PNB et commissions
- **Administration** : Gestion des utilisateurs et logs

## 👤 Rôles

- **DG** : Vue macro groupe
- **DR** : Vue régionale
- **CA** : Vue portefeuille clientèle
- **AR** : Vue agence
- **Admin** : Administration système
