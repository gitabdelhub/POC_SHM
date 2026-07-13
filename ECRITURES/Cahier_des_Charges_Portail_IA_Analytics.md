# Cahier des Charges — Portail IA & Analytics (Open Source)

## 1) Présentation du projet et objectifs

### 1.1 Contexte
L’entreprise souhaite mettre en place un **Portail IA & Analytics** centralisé, moderne et extensible, permettant de :
- consolider des données métier ;
- fournir des tableaux de bord décisionnels ;
- offrir un assistant IA conversationnel sécurisé ;
- accélérer l’analyse opérationnelle et financière.

La solution devra être construite **exclusivement avec des technologies open source**, tout en garantissant la souveraineté des données, la traçabilité et la maintenabilité.

### 1.2 Vision
Créer une plateforme unifiée accessible via le web, qui combine :
- **BI opérationnelle** (KPI, indicateurs, rapports),
- **IA générative** (assistant métier, recherche sémantique, Q&A documentaire),
- **Modules métier** (suivi activités, documents, workflows).

### 1.3 Objectifs stratégiques
1. **Centralisation des données** : unifier les sources dans une base analytique fiable.
2. **Aide à la décision** : visualiser en temps réel les KPI clés.
3. **Productivité** : automatiser les analyses et réponses via IA.
4. **Souveraineté** : hébergement maîtrisé, modèles IA déployables on-premise.
5. **Scalabilité** : architecture modulaire prête pour de nouveaux cas d’usage.

### 1.4 Objectifs opérationnels (mesurables)
- Réduire de **30%** le temps de production des rapports.
- Atteindre un taux d’adoption utilisateur > **70%** à 3 mois post-lancement.
- Assurer une disponibilité de la plateforme > **99,5%**.
- Obtenir un temps de réponse moyen < **2s** pour les dashboards et < **5s** pour les requêtes IA (hors cas complexes).

---

## 2) Architecture technique détaillée (100% open source)

### 2.1 Principes d’architecture
- **Modularité** (frontend, backend, IA, data).
- **API-first** (REST/GraphQL selon besoin).
- **Sécurité by design** (RBAC, chiffrement, audit).
- **Observabilité native** (logs, traces, métriques).
- **Déploiement conteneurisé** (Docker, orchestration Kubernetes optionnelle).

### 2.2 Vue d’ensemble des couches
1. **Couche Présentation**
   - Application web Next.js (App Router, SSR/ISR selon pages).
   - Interface responsive et multilingue (FR prioritaire).

2. **Couche API & Services Métier**
   - API backend (Node.js/TypeScript) via routes Next.js ou service dédié (NestJS/Express open source).
   - Services métier : gestion utilisateurs, KPI, reporting, documents, notifications.

3. **Couche IA**
   - Orchestration LLM via LangChain.
   - Modèle open source **Llama 3** (inférence locale via vLLM/Ollama/TGI selon infra).
   - RAG (Retrieval-Augmented Generation) avec base vectorielle open source (Qdrant/Chroma/pgvector).

4. **Couche Données**
   - PostgreSQL (transactionnel + analytique léger).
   - Extensions : **pgvector** pour embeddings.
   - ETL/ELT open source (Airbyte/DBT) pour ingestion et transformation.

5. **Couche Sécurité & Observabilité**
   - Authentification/SSO via Keycloak (OIDC/SAML).
   - Journalisation : Loki + Promtail.
   - Monitoring : Prometheus + Grafana.
   - Traçage distribué : OpenTelemetry + Jaeger.

### 2.3 Architecture logique (flux)
- Utilisateur ↔ Frontend Next.js
- Frontend ↔ API Gateway/Backend
- Backend ↔ PostgreSQL (données structurées)
- Backend IA ↔ Vector Store (recherche sémantique)
- Backend IA ↔ Llama 3 (génération)
- Backend ↔ Systèmes externes (ERP/CSV/API tiers)

### 2.4 Environnements
- **DEV** : développement local + CI.
- **TEST/UAT** : validation fonctionnelle et métier.
- **PROD** : haute disponibilité, sauvegardes, supervision.

### 2.5 Exigences non fonctionnelles
- Sécurité OWASP Top 10.
- RGPD : gestion du consentement, droit d’accès/suppression.
- RPO ≤ 24h, RTO ≤ 4h.
- Scalabilité horizontale des services API/IA.
- Tests automatisés > 70% couverture sur composants critiques.

---

## 3) Justification de la stack technologique

### 3.1 Next.js (Frontend + BFF)
**Pourquoi :**
- Framework React mature et performant (SSR/ISR).
- Excellente DX, écosystème vaste.
- Possibilité de centraliser frontend et API routes.
- Open source, largement adopté en production.

### 3.2 PostgreSQL
**Pourquoi :**
- SGBD robuste, ACID, fiable en production.
- Fortes capacités SQL analytiques.
- Écosystème riche (extensions, réplication, backup).
- Intégration native avec pgvector.

### 3.3 Llama 3 (LLM open source)
**Pourquoi :**
- Modèle performant pour génération et compréhension.
- Déploiement possible en environnement privé.
- Réduction des dépendances aux APIs propriétaires.
- Adapté aux assistants métier avec garde-fous.

### 3.4 LangChain
**Pourquoi :**
- Standard de fait pour l’orchestration LLM (prompts, tools, memory, chains).
- Accélère l’implémentation de cas RAG.
- Connecteurs multiples vers stores, loaders et outils.

### 3.5 Compléments recommandés
- **Qdrant/pgvector** : recherche vectorielle.
- **Redis** : cache session/réponses fréquentes.
- **Keycloak** : IAM open source (SSO, rôles).
- **Airbyte + dbt** : pipelines data fiables.
- **Grafana/Prometheus/Loki** : observabilité complète.

---

## 4) Fonctionnalités à implémenter

### 4.1 Gestion des accès & authentification
- Authentification sécurisée (OIDC/OAuth2).
- SSO entreprise (optionnel selon SI existant).
- Gestion des rôles (Admin, Analyste, Manager, Utilisateur).
- Politiques de mot de passe + MFA (si activé).
- Journal d’audit des connexions et actions sensibles.

### 4.2 Dashboard Analytics
- Vue d’ensemble des KPI clés (finance, opérations, performance).
- Widgets configurables par rôle.
- Filtres dynamiques (date, entité, activité, région).
- Drill-down vers le détail transactionnel.
- Export PDF/Excel/CSV.

### 4.3 Assistant IA conversationnel
- Chat contextualisé par domaine métier.
- Réponses basées sur connaissances internes via RAG.
- Citations de sources/documents utilisés.
- Historique des conversations et feedback utilisateur.
- Garde-fous : modération, anti-hallucination, règles de confidentialité.

### 4.4 Modules métier
- **Module Documents** : dépôt, indexation, recherche sémantique.
- **Module Reporting** : génération de rapports périodiques.
- **Module Alertes** : alertes sur seuils KPI/anomalies.
- **Module Administration** : utilisateurs, rôles, paramètres IA.

### 4.5 Fonctions transverses
- Notifications (email/in-app).
- Journalisation des actions.
- Paramétrage multilingue (FR/EN).
- API d’intégration externe.

---

## 5) Plan d’implémentation et planning

### 5.1 Approche projet
Méthodologie **Agile (Scrum)**, sprints de 2 semaines, avec jalons de validation métier.

### 5.2 Macro-planning (16 semaines)

#### Phase 0 — Cadrage (S1-S2)
- Ateliers métiers et techniques.
- Définition backlog priorisé.
- Architecture cible validée.

#### Phase 1 — Fondations techniques (S3-S5)
- Setup repo, CI/CD, environnements DEV/TEST.
- Mise en place auth (Keycloak) + RBAC.
- Schéma initial PostgreSQL.

#### Phase 2 — MVP fonctionnel (S6-S9)
- Dashboard principal (KPI critiques).
- Ingestion de données initiales.
- Module utilisateurs/administration.

#### Phase 3 — IA & RAG (S10-S12)
- Déploiement Llama 3 + service d’inférence.
- Pipeline RAG (indexation + retrieval + génération).
- UI assistant IA + traçabilité des réponses.

#### Phase 4 — Industrialisation (S13-S15)
- Optimisations performance/sécurité.
- Observabilité complète + alerting.
- Tests E2E, tests de charge, recette UAT.

#### Phase 5 — Go-live (S16)
- Formation utilisateurs clés.
- Mise en production progressive.
- Hypercare (support renforcé 2 à 4 semaines).

### 5.3 Gouvernance
- COPIL hebdomadaire (métier + IT).
- Revue sprint + démonstration.
- Comité d’architecture bimensuel.

---

## 6) Ressources et compétences requises

### 6.1 Équipe type
- 1 Chef de projet / Product Owner
- 1 Architecte solution
- 2 Développeurs Full Stack (Next.js/Node)
- 1 Data Engineer (ETL/dbt/PostgreSQL)
- 1 Ingénieur IA/LLM (LangChain/RAG)
- 1 DevOps/SRE (CI/CD, conteneurs, monitoring)
- 1 QA/Test Engineer

### 6.2 Compétences clés
- React/Next.js, TypeScript, API design.
- SQL avancé, modélisation PostgreSQL.
- LLM open source, embeddings, RAG, prompt engineering.
- Sécurité applicative (IAM, OWASP, chiffrement).
- Docker, orchestration, observabilité.

### 6.3 Pré-requis infrastructure
- Serveurs CPU/GPU selon volumétrie IA.
- Stockage sécurisé pour documents et logs.
- Réseau interne sécurisé + reverse proxy.

---

## 7) Analyse des risques

| Risque | Impact | Probabilité | Mitigation |
|---|---|---|---|
| Qualité insuffisante des données source | Élevé | Moyen | Data profiling, règles qualité, gouvernance data |
| Hallucinations IA / réponses non fiables | Élevé | Moyen | RAG + citations + guardrails + validation métier |
| Performance IA insuffisante | Moyen/Élevé | Moyen | Optimisation prompts, cache, quantization, scaling |
| Retard projet (scope trop large) | Élevé | Moyen | MVP strict, priorisation backlog, jalons de décision |
| Risques sécurité / conformité | Élevé | Faible/Moyen | Audit sécurité, tests pentest, contrôle d’accès strict |
| Faible adoption utilisateur | Moyen | Moyen | UX soignée, formation, conduite du changement |

---

## 8) Livrables et critères d’acceptation

### 8.1 Livrables attendus
1. Dossier d’architecture technique détaillé.
2. Code source versionné (frontend, backend, IA, data).
3. Schéma de base de données + scripts migrations.
4. Pipelines data (ingestion/transformation).
5. Assistant IA opérationnel (RAG + traçabilité).
6. Dashboards métiers validés.
7. Documentation utilisateur et exploitation.
8. Dossier de sécurité + plan de sauvegarde/reprise.
9. Rapport de tests (unitaires, intégration, E2E, charge).
10. Plan de déploiement et manuel d’exploitation.

### 8.2 Critères d’acceptation (recette)
- **Fonctionnel** : 100% des user stories critiques validées.
- **Performance** : KPI temps de réponse respectés.
- **Sécurité** : conformité OWASP/RBAC/audit validée.
- **Qualité** : taux de succès tests >= 95% en non-régression.
- **IA** : réponses pertinentes avec sources dans > 85% des cas de test.
- **Exploitation** : monitoring/alerting opérationnels.
- **Adoption** : formation réalisée, guide utilisateur livré.

### 8.3 Conditions de succès du projet
- Sponsorship métier fort.
- Disponibilité des experts métier pour la recette.
- Gouvernance continue des données et des prompts IA.

---

## Annexes (recommandées)
- Glossaire métier et technique.
- Matrice RACI projet.
- Catalogue KPI (définitions et formules).
- Politique de rétention des données.
- Charte d’usage responsable de l’IA.

---

**Validation**
- Version : 1.0
- Date : 13/07/2026
- Statut : Soumis pour approbation
