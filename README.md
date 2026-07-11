# POC SAHAM — Portail Analytique

## 1) Vue d’ensemble
Ce dépôt contient un **Proof of Concept (POC)** d’un portail analytique pour SAHAM Bank.
L’objectif est de centraliser, dans une interface unique, des indicateurs métiers pour le pilotage commercial, le risque et la qualité de service.

## 2) Contexte métier et objectif
Le projet vise à fournir une base de démonstration pour :
- visualiser des KPI bancaires par profil utilisateur ;
- simuler des parcours de consultation pour différentes directions ;
- préparer une industrialisation progressive (intégration SI, gouvernance des accès, connecteurs BI).

## 3) Fonctionnalités / cas d’usage (POC)
- **Tableaux de bord de pilotage** (indicateurs globaux, tendances).
- **Ciblage & campagnes**.
- **Espace engagements** (octroi, suivi des dossiers).
- **Qualité de service clientèle**.
- **Analyse des risques**.
- **Console d’administration** (utilisateurs, accès, dashboards).
- **Placeholder d’intégration Power BI** pour la démonstration.

## 4) Stack technique
- **Front-end** : HTML/CSS/JavaScript + Vite
- **Visualisation** : D3 Geo / TopoJSON
- **Runtime** : Node.js
- **Outils** : TypeScript (vérification statique), npm

## 5) Structure du dépôt
```text
POC_SAHAM/
├── README.md                  # Présentation projet
├── CONTRIBUTING.md            # Règles de contribution
├── docs/
│   └── README.md              # Guide de structure et conventions
├── index.html                 # Entrée principale de l’interface POC
├── scripts.js                 # Logique front-end principale
├── assets/                    # Ressources visuelles
├── public/                    # Ressources publiques
├── *.geojson                  # Données cartographiques de démonstration
└── fix_*.cjs / patch_*.cjs    # Scripts utilitaires de maintenance ponctuelle
```

## 6) Installation locale et usage
### Prérequis
- Node.js 20+
- npm

### Démarrage
```bash
npm ci
npm run dev
```
Application disponible sur : `http://localhost:3000`

### Vérifications utiles
```bash
npm run build
npm run lint
```
> Remarque : `npm run lint` peut faire ressortir des écarts historiques du POC.

## 7) Équipe / contributeurs
- **Porteur du projet** : @gitabdelhub
- **Contributeurs techniques** : voir l’historique Git du dépôt

## 8) Roadmap (court terme)
- Clarifier davantage la séparation entre code applicatif et scripts de maintenance.
- Structurer les modules JS par domaine métier.
- Ajouter une documentation technique par module (données, règles, dépendances).

---
Pour un guide rapide de contribution et d’organisation, consulter aussi :
- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`docs/README.md`](./docs/README.md)
