# Documentation — Structure du dépôt

Ce dossier centralise la documentation destinée aux stagiaires, encadrants et contributeurs.

## Lecture recommandée
1. `README.md` (racine) — vue globale du projet.
2. `CONTRIBUTING.md` — règles de contribution.
3. Ce document — repères de structure.

## Repères de structure
- `index.html` : point d’entrée de l’interface POC.
- `scripts.js` : logique applicative principale côté front.
- `assets/` et `public/` : ressources statiques.
- `*.geojson` : données cartographiques utilisées dans les visualisations.
- `fix_*.cjs` / `patch_*.cjs` : scripts utilitaires historiques (maintenance ponctuelle).

## Convention de lisibilité
- Documenter tout nouveau dossier ajouté.
- Éviter de mélanger scripts temporaires et code produit.
- Supprimer ou archiver les scripts obsolètes lorsqu’ils ne sont plus nécessaires.
