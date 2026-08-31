"""
Service Text-to-SQL & Tool Calling : transforme une question en langage naturel
en requete analytique ou en appel d'outil metier (Contexte Temporel, Generateur de Graphiques
avances dont boites a moustaches/boxplots, calculs statistiques, requetes SQL Gold).
"""

import hashlib
import math
import re
import time
from typing import Any, Dict, List, Optional
from functools import lru_cache

from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User, UserRole
from app.services.rag.llm import LLMClient
from app.services.rag.vector_store import (
    execute_read_only_sql,
    format_schema_for_prompt,
    get_gold_schema,
)

# Cache en mémoire pour les réponses fréquentes
_response_cache: Dict[str, Any] = {}
_cache_ttl = 300  # 5 minutes de cache

# ==============================================================================
# VALIDATION DES QUESTIONS PAR RÔLE (RBAC)
# ==============================================================================

def validate_question_by_role(question: str, user: User) -> tuple[bool, Optional[str]]:
    """
    Valide si une question est autorisée selon le rôle de l'utilisateur.
    
    Retourne (is_allowed, error_message)
    """
    question_lower = question.lower()
    role = user.role
    
    # Règles par rôle
    role_restrictions = {
        UserRole.DG: {
            "allowed_patterns": [r".*"],  # Tout est autorisé pour le DG
            "forbidden_patterns": []
        },
        UserRole.DR: {
            "allowed_patterns": [
                r"\bpnb\b", r"\bperformance\b", r"\bcr[ée]dit\b", r"\bencours\b",
                r"\bagence\b", r"\bclient\b", r"\brisque\b", r"\bnpl\b",
                r"\bmois\b", r"\bann[ée]e\b", r"\b[ée]volution\b", r"\btendance\b"
            ],
            "forbidden_patterns": [
                r"\bglobal\b", r"\bnationale\b", r"\bbanque enti[èe]re\b",
                r"\btoutes les r[ée]gions\b", r"\bcomparaison.*r[ée]gion\b",
                r"\bdr.*dr\b", r"\bdirecteur.*r[ée]gional.*r[ée]gional\b"
            ]
        },
        UserRole.CA: {
            "allowed_patterns": [
                r"\bpnb\b", r"\bperformance\b", r"\bcr[ée]dit\b", r"\bencours\b",
                r"\bclient\b", r"\bsatisfaction\b", r"\bmois\b", r"\bann[ée]e\b"
            ],
            "forbidden_patterns": [
                r"\bglobal\b", r"\bnationale\b", r"\bbanque enti[èe]re\b",
                r"\btoutes les r[ée]gions\b", r"\bcomparaison.*r[ée]gion\b",
                r"\bautres agences\b", r"\btop.*agences\b", r"\bclassement.*agences\b",
                r"\bbenchmark\b", r"\bcomparaison\b", r"\bvs\b",
                r"\brisque.*npl\b", r"\bprobabilit[ée].*d[ée]faut\b"
            ]
        },
        UserRole.AR: {
            "allowed_patterns": [
                r"\brisque\b", r"\bnpl\b", r"\bclient.*risque\b", r"\bprobabilit[ée]\b",
                r"\bcr[ée]dit.*risque\b", r"\bencours.*risque\b", r"\bdefault\b",
                r"\bscoring\b", r"\bnotation\b", r"\bclassification\b"
            ],
            "forbidden_patterns": [
                r"\bpnb\b", r"\bproduit.*net.*bancaire\b", r"\bchiffre.*affaires\b",
                r"\bprofit\b", r"\bmarge\b", r"\bb[ée]n[ée]fice\b",
                r"\bcompte.*r[ée]sultat\b", r"\brentabilit[ée]\b",
                r"\bperformance.*financi[èe]re\b"
            ]
        },
        UserRole.ADMIN: {
            "allowed_patterns": [
                r"\bsyst[èe]me\b", r"\butilisateur\b", r"\bconnexion\b", r"\blog\b",
                r"\bstatus\b", r"\b[ée]tat\b", r"\bserviteur\b", r"\bdatabase\b"
            ],
            "forbidden_patterns": [
                r"\bpnb\b", r"\bcr[ée]dit\b", r"\bclient\b", r"\bperformance\b",
                r"\brisque\b", r"\bnpl\b", r"\bencours\b"
            ]
        }
    }
    
    restrictions = role_restrictions.get(role)
    if not restrictions:
        return False, f"Rôle non reconnu : {role}"
    
    # Vérifier les patterns interdits
    for pattern in restrictions["forbidden_patterns"]:
        if re.search(pattern, question_lower):
            error_msg = get_forbidden_message(pattern, role)
            return False, error_msg
    
    # Vérifier les patterns autorisés (si restreint)
    if restrictions["allowed_patterns"] and restrictions["allowed_patterns"] != [r".*"]:
        allowed = False
        for pattern in restrictions["allowed_patterns"]:
            if re.search(pattern, question_lower):
                allowed = True
                break
        
        if not allowed:
            return False, get_not_allowed_message(role)
    
    return True, None

def get_forbidden_message(pattern: str, role: UserRole) -> str:
    """Génère un message d'erreur personnalisé selon le pattern et le rôle."""
    if role == UserRole.DR:
        if "global" in pattern or "nationale" in pattern:
            return "En tant que Directeur Régional, vous n'avez accès qu'aux données de votre région. Pour les données globales, contactez la Direction Générale."
        if "comparaison.*région" in pattern:
            return "Les comparaisons inter-régionales ne sont pas autorisées pour votre rôle. Contactez la Direction Générale pour les analyses multi-régionales."
    
    elif role == UserRole.CA:
        if "global" in pattern or "nationale" in pattern:
            return "En tant que Chef d'Agence, vous n'avez accès qu'aux données de votre agence. Pour les données globales, contactez votre Directeur Régional."
        if "comparaison" in pattern or "vs" in pattern:
            return "Les comparaisons entre agences ne sont pas autorisées pour votre rôle. Contactez votre Directeur Régional pour les benchmarks."
        if "risque" in pattern or "npl" in pattern:
            return "Les données de risque sont restreintes. Contactez l'Analyste Risque pour ces informations."
    
    elif role == UserRole.AR:
        if "pnb" in pattern or "profit" in pattern:
            return "En tant qu'Analyste Risque, vous n'avez accès qu'aux données de risque. Les données financières sont restreintes."
    
    elif role == UserRole.ADMIN:
        return "Les questions métiers ne sont pas autorisées pour le rôle Administrateur. Utilisez la console d'administration pour les tâches système."
    
    return "Cette question n'est pas autorisée pour votre rôle. Contactez votre supérieur hiérarchique."

def get_not_allowed_message(role: UserRole) -> str:
    """Génère un message pour les questions non autorisées."""
    messages = {
        UserRole.DR: "Votre question ne correspond pas aux types d'analyses autorisées pour les Directeurs Régionaux.",
        UserRole.CA: "Votre question ne correspond pas aux types d'analyses autorisées pour les Chefs d'Agence.",
        UserRole.AR: "Votre question ne correspond pas aux types d'analyses autorisées pour les Analystes Risque.",
        UserRole.ADMIN: "Votre question ne correspond pas aux tâches administratives autorisées."
    }
    return messages.get(role, "Question non autorisée pour votre rôle.")

def _get_cache_key(question: str, user_id: int) -> str:
    """Génère une clé de cache basée sur la question et l'utilisateur."""
    key_str = f"{user_id}:{question.lower().strip()}"
    return hashlib.md5(key_str.encode()).hexdigest()

def _get_from_cache(cache_key: str) -> Optional[Dict[str, Any]]:
    """Récupère une réponse du cache si elle est encore valide."""
    if cache_key in _response_cache:
        cached = _response_cache[cache_key]
        if time.time() - cached["timestamp"] < _cache_ttl:
            return cached["response"]
        else:
            del _response_cache[cache_key]  # Cache expiré
    return None

def _set_cache(cache_key: str, response: Dict[str, Any]) -> None:
    """Stocke une réponse dans le cache."""
    _response_cache[cache_key] = {
        "response": response,
        "timestamp": time.time()
    }

def _build_system_sql_prompt(schema_txt: str) -> str:
    """Construit le prompt systeme SQL avec la date courante dynamique."""
    from datetime import date as _date
    today = _date.today()
    jours_fr = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    mois_fr = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
               "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    annee_mois = f"{today.year}-{today.month:02d}"
    date_str = f"{jours_fr[today.weekday()]} {today.day} {mois_fr[today.month]} {today.year}"
    trimestre = (today.month - 1) // 3 + 1
    return f"""\
Tu es SahamAI, l'assistant analytique et decisionnel de Saham Bank (banque marocaine).
Date de reference du systeme : {date_str} (Exercice {today.year}, T{trimestre}, mois {annee_mois}).

Tu reponds aux questions sur la banque en generant des requetes SQL uniquement a partir du schema "Gold" ci-dessous.

SYNONYMES BANCAIRES A RECONNAITRE :
- "benefice", "profit", "gain", "rentabilité" → PNB (Produit Net Bancaire)
- "pret", "emprunt", "financement" → crédit
- "depôt", "épargne", "placement" → dépôt/épargne
- "client en difficulté", "client problématique" → client à risque élevé
- "creance douteuse", "pret en souffrance" → NPL/encours Contentieux
- "performance", "resultat", "rentabilité agence" → performance/PNB
- "taux d'interet", "marge" → NIM (Net Interest Margin)
- "satisfaction", "qualité service" → note_satisfaction_client

DEFINITIONS METIER BANCAIRE (KPIs) :
- PNB (Produit Net Bancaire) : Marge brute générée par les activités bancaires. Calculé comme ~3.5% des encours de crédits avec variations saisonnières.
- NIM (Net Interest Margin) : Marge nette d'intérêts, indicateur de rentabilité des activités de prêt. Calculé comme ~4.5% des encours.
- NPL (Non-Performing Loans) : Prêts en souffrance, ratio de crédits douteux (statut Surveillance/Contentieux). Un NPL élevé indique un risque accru.
- Encours : Montant total des crédits accordés et non remboursés.
- Score client : Note de risque client (0-100). Score < 40 = risque élevé, 40-69 = risque moyen, ≥ 70 = faible risque.
- Ratio crédits/dépôts : Indicateur de liquidité, ratio entre montants crédités et dépôts collectés.
- Taux de réalisation : Pourcentage de réalisation des objectifs commerciaux.
- NPS/ Satisfaction : Note de satisfaction client (typiquement 1-5 ou 1-10).

{schema_txt}

IMPORTANT — Granularite temporelle des donnees :
- TOUTES les tables de faits (`fact_performance`, `fact_engagement`, `fact_risque`) sont MENSUELLES et AGREGEES par mois.
- Il n'existe PAS de ligne pour un jour specifique. Filtrer sur une date exacte (ex: WHERE date = CURRENT_DATE) retournera TOUJOURS 0 lignes.
- Quand l'utilisateur combine une question bancaire avec "aujourd'hui", "actuel", "en ce moment", "a ce jour" → C'est une demande sur les donnees bancaires actuelles, PAS sur la date elle-meme.
- Pour "le PNB actuel" ou "le PNB d'aujourd'hui" ou "le PNB de la banque a la date d'aujourd'hui" : `SELECT COALESCE(SUM(pnb), 0) AS pnb_total_mad FROM fact_performance` (somme globale de tous les mois, NE filtre PAS sur date).
- Pour "le PNB de ce mois" ou "le PNB de {mois_fr[today.month]} {today.year}" : filtre sur `dim_date.annee_mois = '{annee_mois}'`.
- Si la question mentionne a la fois un indicateur bancaire (PNB, encours, credits, etc.) ET une reference temporelle, priorise TOUJOURS l'indicateur bancaire et ignore la date precise.

Regles de modelisation et de calcul :
1. PNB (Produit Net Bancaire) :
   - Le PNB mensuel par agence se trouve dans `fact_performance.pnb` (ex: `SELECT COALESCE(SUM(pnb), 0) AS pnb_total_mad FROM fact_performance`).
   - Pour le PNB global ou actuel, fais la somme `COALESCE(SUM(pnb), 0) AS pnb_total`.
   - Pour l'evolution mensuelle temporelle :
     `SELECT dd.annee_mois, COALESCE(SUM(fp.pnb), 0) AS pnb_total FROM fact_performance fp JOIN dim_date dd ON fp.date_id = dd.date_id GROUP BY dd.annee_mois ORDER BY dd.annee_mois`
2. Credits et Engagements :
   - Les encours de credits sont dans `fact_engagement.montant` ou `fact_performance.encours_credits`.
   - Les types de credit se trouvent dans `dim_type_credit.libelle` (jointure `fact_engagement.type_credit_id = dim_type_credit.type_credit_id`).
3. Clients et Risque :
   - Les clients sont dans `dim_client` (`encours_actuel`, `score_actuel`, `statut_actuel`).
   - Le risque est suivi dans `fact_risque` (`score_risque`, `classe_risque`, `npl_flag`).
4. Toujours utiliser `COALESCE(...)` sur les agregats (`SUM`, `AVG`, `COUNT`) pour eviter les resultats NULL.
5. Gestion des Visualisations :
   - Si l'utilisateur demande une boite a moustaches (boxplot), dispersion ou distribution : genere une requete ramenant les valeurs individuelles groupees par categorie (ex: `SELECT dtc.libelle, fe.montant FROM fact_engagement fe JOIN dim_type_credit dtc ON fe.type_credit_id = dtc.type_credit_id LIMIT 1000`) et mets `"chart_type": "boxplot"`.
   - Si l'utilisateur demande une courbe temporelle (evolution, tendance, line chart) : regroupe par `dim_date.annee_mois` et mets `"chart_type": "line"`.
   - Si l'utilisateur demande une repartition / parts : mets `"chart_type": "pie"` ou `"donut"`.
   - Pour les classements ou comparaisons : mets `"chart_type": "bar"`.

Regles de reponse :
- Genere TOUJOURS une seule requete SELECT valide (jamais INSERT, UPDATE, DELETE, ALTER...). Pas de point-virgule final.
- Reponds UNIQUEMENT sous forme d'un objet JSON valide au format :
  {{"mode": "sql", "sql": "<requete>", "sql_explanation": "<explication>", "chart_type": "bar|line|pie|donut|boxplot|none"}}
- Si la question est hors-sujet bancaire (meteo generale, cuisine, etc.), renvoie :
  {{"mode": "oob", "answer": "Je suis SahamAI, l'assistant decisionnel de Saham Bank. Que puis-je faire pour vous ?", "sql": null, "sql_explanation": null, "chart_type": "none"}}
- Pour les questions complexes (avec "et", "ainsi que", "plus"), priorise la partie principale ou génère une requête combinée avec UNION si approprié.
- Si la question demande une comparaison ("vs", "par rapport à", "évolution"), utilise GROUP BY temporel ou spatial pour permettre la comparaison.
EXEMPLES DE REFERENCE (requetes verifiees sur la vraie base) :

Q: "Quel est le PNB de cette annee ?"
SQL: SELECT COALESCE(SUM(fp.pnb), 0) AS pnb_total FROM fact_performance fp JOIN dim_date d ON fp.date_id = d.date_id WHERE d.annee = {today.year}
-> Toute question avec une periode passe par une jointure sur dim_date.

Q: "Quelle agence a le plus fort taux de NPL ?"
SQL: SELECT da.nom, ROUND(AVG(fp.npl_ratio)::numeric, 2) AS npl_moyen FROM fact_performance fp JOIN dim_agence da ON fp.agence_id = da.agence_id GROUP BY da.nom ORDER BY npl_moyen DESC LIMIT 10
-> Un RATIO se moyenne (AVG), il ne se somme JAMAIS.

Q: "Combien de clients a risque eleve ?"
SQL: SELECT COUNT(*) AS nb_clients FROM dim_client WHERE score_actuel < 40
-> L etat courant du client est dans dim_client ; fact_risque sert a l EVOLUTION.

Q: "Evolution du PNB mois par mois"
SQL: SELECT d.annee_mois, COALESCE(SUM(fp.pnb), 0) AS pnb FROM fact_performance fp JOIN dim_date d ON fp.date_id = d.date_id WHERE d.annee = {today.year} GROUP BY d.annee_mois ORDER BY d.annee_mois
-> Serie temporelle : GROUP BY annee_mois, ORDER BY croissant, chart_type "line".

Q: "Repartition des credits par famille pour l'agence Casa"
SQL: SELECT dtc.libelle AS famille_credit, COALESCE(SUM(fe.montant), 0) AS total_montant FROM fact_engagement fe JOIN dim_type_credit dtc ON fe.type_credit_id = dtc.type_credit_id JOIN dim_agence da ON fe.agence_id = da.agence_id WHERE da.nom LIKE '%Casa%' GROUP BY dtc.libelle ORDER BY total_montant DESC
-> Jointure fact_engagement avec dim_type_credit pour les familles de credit et dim_agence pour filtrer par agence.

Q: "Quelle est la repartition des credits par agence ?"
SQL: SELECT da.nom AS agence, COALESCE(SUM(fe.montant), 0) AS total_encours FROM fact_engagement fe JOIN dim_agence da ON fe.agence_id = da.agence_id GROUP BY da.nom ORDER BY total_encours DESC
-> Repartition par agence : GROUP BY dim_agence.nom, SUM des montants.

Q: "Quel est le total des encours de credits ?"
SQL: SELECT COALESCE(SUM(montant), 0) AS total_encours FROM fact_engagement
-> Somme globale des montants de credits.

Q: "Quelles sont les agences avec le plus de NPL ?"
SQL: SELECT da.nom AS agence, ROUND(AVG(fp.npl_ratio), 2) AS npl_moyen FROM fact_performance fp JOIN dim_agence da ON fp.agence_id = da.agence_id GROUP BY da.nom ORDER BY npl_moyen DESC LIMIT 10
-> Moyenne du ratio NPL par agence, classement.

Q: "Combien de clients sont a risque eleve ?"
SQL: SELECT COUNT(*) AS nb_clients_risque FROM dim_client WHERE score_actuel < 40
-> Comptage des clients avec score < 40.

Q: "Evolution du PNB mensuel cette annee"
SQL: SELECT dd.annee_mois, COALESCE(SUM(fp.pnb), 0) AS pnb FROM fact_performance fp JOIN dim_date dd ON fp.date_id = dd.date_id WHERE dd.annee = 2026 GROUP BY dd.annee_mois ORDER BY dd.annee_mois
-> Serie temporelle du PNB mensuel.

Q: "Quel est le NIM moyen de la banque ?"
SQL: SELECT ROUND(AVG(nim), 2) AS nim_moyen FROM fact_performance
-> Moyenne du Net Interest Margin.

Q: "Top 5 des agences par PNB"
SQL: SELECT da.nom AS agence, COALESCE(SUM(fp.pnb), 0) AS total_pnb FROM fact_performance fp JOIN dim_agence da ON fp.agence_id = da.agence_id GROUP BY da.nom ORDER BY total_pnb DESC LIMIT 5
-> Classement des agences par PNB total.

Q: "Quelle est la satisfaction client moyenne ?"
SQL: SELECT ROUND(AVG(note_satisfaction_client), 2) AS satisfaction_moyenne FROM fact_qualite
-> Moyenne des notes de satisfaction.

Q: "Nombre de reclamations par agence"
SQL: SELECT da.nom AS agence, SUM(fq.reclamations_ouvertes) AS total_reclamations FROM fact_qualite fq JOIN dim_agence da ON fq.agence_id = da.agence_id GROUP BY da.nom ORDER BY total_reclamations DESC
-> Comptage des reclamations par agence.

DEFINITIONS METIER FIXES (n invente jamais tes propres seuils) :
- "Client a risque eleve"  -> dim_client WHERE score_actuel < 40
- "Client sain"            -> dim_client WHERE score_actuel >= 60
- "Client actif"           -> dim_client WHERE statut_actuel = 'Actif'
- "Creance en souffrance"  -> fact_risque WHERE npl_flag = true
- "Agence la plus performante" -> plus fort SUM(fp.pnb)
Deux questions identiques doivent produire le MEME SQL.

ERREURS A NE JAMAIS COMMETTRE :
- Sommer un ratio (npl_ratio, nim, taux) au lieu de le moyenner.
- Oublier la jointure dim_date quand la question mentionne une periode.
- Joindre fact_performance et fact_engagement directement : leurs grains
  different (agence x mois d un cote, dossier de credit de l autre) et les
  combiner produit un DOUBLE COMPTAGE. Passe par une sous-requete.
- Afficher un identifiant technique (agence_id) quand un libelle existe (dim_agence.nom).

"""

SYSTEM_SQL_PROMPT = ""

def _get_summary_prompt() -> str:
    from datetime import date as _date
    today = _date.today()
    mois_fr = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
               "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    return f"""Tu es SahamAI, l'assistant analytique de Saham Bank.
Tu t'adresses a des dirigeants et decideurs METIER (DG, DR, Analystes).
Date courante : {today.day} {mois_fr[today.month]} {today.year}. Les donnees sont mensuelles et couvrent 2023-01 a {today.year}-{today.month:02d}.

CONSIGNE STRICTE DE CONCISION (TRES IMPORTANT) :
- Sois TRES SYNTHETIQUE, concis et direct. Pas de long pave verbeux ni de bavardage.
- Donne la reponse essentielle en 1 a 2 phrases claires maximum.
- Quand un graphique ou un tableau est genere, le graphique parle de lui-meme : donne uniquement le fait saillant ou le total general.
- N'enumere PAS toute la liste des mois ou des statistiques techniques si un graphique est fourni.
- S'il s'agit d'une valeur unique, donne le montant exact formate : "35 983 057,16 MAD".
- N'utilise jamais de jargon technique (SQL, colonnes, jointures).
- Le nombre d elements que tu cites doit correspondre EXACTEMENT au nombre de
  lignes qui t est fourni. Ne dis jamais "les 10 agences" si on t en donne 16 :
  compte ce que tu recois, n invente aucun total.
- Si le resultat est 0 ou vide, explique que les donnees sont mensuelles (pas journalieres) et propose de chercher sur une periode.

AMELIORATION ANALYTIQUE :
|- Pour les series temporelles (evolution, tendance), mentionne la tendance generale : "en hausse", "en baisse", "stable".
|- Pour les classements, mentionne le leader et l'ecart si pertinent : "X domine avec Y MAD devant Z".
|- Pour les ratios, donne leur interpretation business : "NPL eleve indiquant un risque accru".
|- Pour les comparaisons, mentionne les differences significatives : "Agence A +15% vs moyenne".
"""

SYSTEM_SUMMARY_PROMPT = _get_summary_prompt()  # Evalué au démarrage ; suffisant car le serveur redémarre chaque jour


def _extract_tables(sql: str) -> List[str]:
    tables = re.findall(r"\b(?:from|join)\s+([a-z_][a-z0-9_]*)", sql, re.I)
    seen, out = set(), []
    for t in tables:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out


def _as_float(value: Any) -> Optional[float]:
    try:
        f = float(value)
        return f if math.isfinite(f) else None
    except (TypeError, ValueError):
        return None


def _percentile(sorted_data: List[float], p: float) -> float:
    if not sorted_data:
        return 0.0
    k = (len(sorted_data) - 1) * (p / 100.0)
    f = int(k)
    c = min(f + 1, len(sorted_data) - 1)
    d = k - f
    return sorted_data[f] + d * (sorted_data[c] - sorted_data[f])


def _compute_boxplot(columns: List[str], rows: List[List[Any]]) -> Optional[Dict[str, Any]]:
    """Calcule le resume a 5 nombres (Min, Q1, Mediane, Q3, Max) et outliers pour une boite a moustaches."""
    if not rows or len(columns) < 2:
        return None

    groups: Dict[str, List[float]] = {}
    for r in rows:
        if len(r) < 2:
            continue
        cat = str(r[0])
        val = _as_float(r[1])
        if val is not None:
            groups.setdefault(cat, []).append(val)

    if not groups:
        return None

    boxes = []
    for cat, vals in list(groups.items())[:8]:
        if len(vals) < 2:
            continue
        s_vals = sorted(vals)
        q1 = _percentile(s_vals, 25)
        med = _percentile(s_vals, 50)
        q3 = _percentile(s_vals, 75)
        iqr = q3 - q1
        min_whisker = max(min(s_vals), q1 - 1.5 * iqr)
        max_whisker = min(max(s_vals), q3 + 1.5 * iqr)
        outliers = [round(v, 2) for v in s_vals if v < min_whisker or v > max_whisker][:6]

        boxes.append({
            "label": cat,
            "min": round(min_whisker, 2),
            "q1": round(q1, 2),
            "median": round(med, 2),
            "q3": round(q3, 2),
            "max": round(max_whisker, 2),
            "outliers": outliers,
        })

    if not boxes:
        return None

    return {
        "type": "boxplot",
        "title": "Distribution & Boites a Moustaches",
        "boxes": boxes,
        "tool_used": "statistical_boxplot_tool",
    }


def _detect_chart_type(
    columns: List[str], rows: List[List[Any]], hint: Optional[str], question: str
) -> str:
    q_lower = question.lower()
    if any(k in q_lower for k in ["boite a moustache", "boite a moustaches", "boîte à moustache", "boîte à moustaches", "boxplot", "dispersion", "quartile"]):
        return "boxplot"
    if any(k in q_lower for k in ["courbe", "line chart", "evolution", "évolution", "tendance", "historique", "progression"]):
        return "line"
    if any(k in q_lower for k in ["camembert", "pie chart", "repartition", "répartition", "donut", "proportion", "part"]):
        return "pie"
    if any(k in q_lower for k in ["heatmap", "carte", "geographique", "spatial"]):
        return "heatmap"
    if any(k in q_lower for k in ["funnel", "entonnoir", "conversion"]):
        return "funnel"

    if hint in ("boxplot", "bar", "line", "pie", "donut", "heatmap", "funnel"):
        return hint

    if len(columns) < 2 or len(rows) < 2:
        return "none"

    values = [_as_float(r[1]) for r in rows]
    if not any(v is not None for v in values):
        return "none"

    first = str(rows[0][0])
    if re.match(r"^\d{4}-\d{2}", first) or "trimestre" in first.lower() or "mois" in first.lower() or "annee" in first.lower():
        return "line"
    if "ville" in str(columns).lower() or "region" in str(columns).lower() or "agence" in str(columns).lower():
        return "bar"  # Meilleur pour les données géographiques
    return "pie" if len(rows) <= 6 else "bar"


def _build_chart(columns: List[str], rows: List[List[Any]], chart_type: str, question: str):
    if chart_type == "none" or len(columns) < 2 or not rows:
        return None

    if chart_type == "boxplot":
        bp = _compute_boxplot(columns, rows)
        if bp:
            return bp

    labels = [str(r[0]) for r in rows]
    values = [round(f, 2) for f in (_as_float(r[1]) for r in rows) if f is not None]
    if len(values) != len(rows):
        return None

    # Génération de titre intelligent basé sur la question et les colonnes
    titre_intelligent = _generer_titre_graphique(columns, chart_type, question)

    return {
        "type": chart_type,
        "title": titre_intelligent,
        "labels": labels,
        "values": values,
        "tool_used": "chart_visualizer_tool",
    }

def _generer_titre_graphique(columns: List[str], chart_type: str, question: str) -> str:
    """Génère un titre de graphique pertinent basé sur le contexte."""
    if len(columns) >= 2:
        col_x = columns[0].replace("_", " ").title()
        col_y = columns[1].replace("_", " ").title()
        
        if chart_type == "line":
            return f"Évolution de {col_y} par {col_x}"
        elif chart_type == "pie":
            return f"Répartition de {col_y} par {col_x}"
        elif chart_type == "bar":
            return f"Comparaison de {col_y} par {col_x}"
        elif chart_type == "boxplot":
            return f"Distribution de {col_y} par {col_x}"
    
    # Fallback basé sur la question
    question_lower = question.lower()
    if "pnb" in question_lower:
        return "Analyse du Produit Net Bancaire"
    elif "credit" in question_lower or "crédit" in question_lower:
        return "Analyse des Crédits"
    elif "agence" in question_lower:
        return "Performance par Agence"
    elif "risque" in question_lower:
        return "Analyse du Risque"
    else:
        return f"Analyse : {columns[1] if len(columns) > 1 else 'Données'}"

def _generer_suggestion_erreur(question: str, error: str) -> str:
    """Génère des suggestions basées sur le type d'erreur."""
    error_lower = error.lower()
    question_lower = question.lower()
    
    # Erreurs de table/colonne introuvable
    if "column" in error_lower or "table" in error_lower or "does not exist" in error_lower:
        if "casa" in question_lower:
            return "L'agence 'Casa' n'existe peut-être pas. Essayez 'Casablanca' ou consultez la liste des agences."
        elif "famille" in question_lower:
            return "Les données de familles de crédits ne sont pas disponibles directement. Essayez une question sur les types de crédits."
        else:
            return "Vérifiez les termes utilisés ou essayez une formulation plus générale."
    
    # Erreurs de date/temps
    if "date" in error_lower or "time" in error_lower:
        return "Les données sont mensuelles. Essayez sans préciser de date exacte ou demandez une période."
    
    # Erreurs de jointure
    if "join" in error_lower or "ambiguous" in error_lower:
        return "La requête est complexe. Simplifiez votre question ou séparez-la en plusieurs parties."
    
    # Erreurs de syntaxe SQL
    if "syntax" in error_lower:
        return "Erreur de génération SQL. Reformulez votre question différemment."
    
    # Erreur générique
    return f"Erreur technique : {error}. Essayez de reformuler votre question."

# ========== TOOL CALLING AVANCÉ ==========

def _check_tool_calling(question: str, db: Session) -> Optional[Dict[str, Any]]:
    """Détecte si la question peut être traitée par un outil spécialisé."""
    question_lower = question.lower()
    
    # Patterns pour détection d'outils
    tool_patterns = {
        "kpi_calculator": [
            r"\bkpi\b", r"\bindicateur\b", r"\bperformance.*globale\b", 
            r"\bsant[ée].*banque\b", r"\bdiagnostic\b"
        ],
        "comparison_tool": [
            r"\bcompar\b", r"\bvs\b", r"\bcontre\b", r"\bpar rapport [àa]\b"
        ],
        "ranking_tool": [
            r"\btop\b", r"\bclassement\b", r"\bmeilleur\b", r"\bpire\b", 
            r"\bleading\b", r"\bbottom\b"
        ],
        "trend_analyzer": [
            r"\b[ée]volution\b", r"\btendance\b", r"\bprogression\b", 
            r"\btrend\b", r"\bhistorique\b", r"\bmensuel\b"
        ],
        "email_generator": [
            r"\bemail\b", r"\bmail\b", r"\benvoyer\b", r"\bnotification\b",
            r"\bmessage\b", r"\bcontacter\b"
        ],
        "alert_generator": [
            r"\balerte\b", r"\bnotification.*critique\b", r"\bseuil\b",
            r"\bd[ée]passement\b", r"\bwarning\b"
        ],
        "summary_tool": [
            r"\br[ée]sum[ée]\b", r"\bsynth[èe]se\b", r"\b[ée]tat.*actuel\b",
            r"\bsituation\b", r"\bglobal\b", r"\bvue d'ensemble\b"
        ],
        "prediction_tool": [
            r"\bprediction\b", r"\bpr[ée]voir\b", r"\bestim[ée]\b", r"\bpr[eé]visions\b",
            r"\bfutur\b", r"\bsera\b", r"\bprochain.*mois\b", r"\btendance.*future\b"
        ],
    }
    
    # Détection de l'outil approprié
    detected_tool = None
    for tool_name, patterns in tool_patterns.items():
        if any(re.search(pattern, question_lower) for pattern in patterns):
            detected_tool = tool_name
            break
    
    if not detected_tool:
        return None
    
    # Exécution de l'outil détecté
    try:
        tool_handler = ToolCallHandler(db)
        
        if detected_tool == "kpi_calculator":
            # Déterminer le KPI approprié
            kpi_mapping = {
                "pnb": "pnb_total",
                "npl": "npl_average", 
                "nim": "nim_average",
                "encours": "total_encours",
                "risque": "high_risk_clients",
                "satisfaction": "satisfaction_avg"
            }
            
            kpi_type = None
            for keyword, kpi in kpi_mapping.items():
                if keyword in question_lower:
                    kpi_type = kpi
                    break
            
            if not kpi_type:
                kpi_type = "pnb_total"  # Default
            
            result = tool_handler.execute_tool("kpi_calculator", {"kpi_type": kpi_type})
            
            if result.get("success"):
                value = result.get("value")
                unit = result.get("unit", "")
                return {
                    "mode": "tool_call",
                    "answer": f"Le KPI {kpi_type} est de {value:,.2f} {unit}." if value else "KPI non disponible",
                    "tool_used": detected_tool,
                    "tool_params": {"kpi_type": kpi_type},
                    "chart": None,
                    "from_cache": False
                }
        
        elif detected_tool == "ranking_tool":
            # Déterminer le type de classement
            if "top" in question_lower and "agence" in question_lower:
                ranking_type = "top_agences_pnb"
            elif "pire" in question_lower or "bottom" in question_lower:
                ranking_type = "bottom_agences_npl"
            else:
                ranking_type = "top_agences_pnb"
            
            result = tool_handler.execute_tool("ranking_tool", {"ranking_type": ranking_type, "limit": 5})
            
            if result.get("success"):
                rows = result.get("rows", [])
                if rows:
                    answer = f"Classement {ranking_type} : " + ", ".join([f"{r[0]} ({r[1]:,.2f})" for r in rows[:3]])
                    return {
                        "mode": "tool_call",
                        "answer": answer,
                        "tool_used": detected_tool,
                        "tool_params": {"ranking_type": ranking_type},
                        "columns": result.get("columns"),
                        "rows": rows,
                        "row_count": len(rows),
                        "chart": {"type": "bar", "title": f"Classement: {ranking_type}", "labels": [r[0] for r in rows], "values": [r[1] for r in rows]},
                        "from_cache": False
                    }
        
        elif detected_tool == "trend_analyzer":
            # Déterminer la métrique de tendance
            metric = "pnb" if "pnb" in question_lower else "npl"
            result = tool_handler.execute_tool("trend_analyzer", {"metric": metric, "period": "2026"})
            
            if result.get("success"):
                trend_analysis = result.get("trend_analysis", {})
                trend = trend_analysis.get("trend", "inconnue")
                change_pct = trend_analysis.get("change_percentage", 0)
                
                answer = f"Tendance {metric} : {trend} ({change_pct:+.1f}%)."
                
                rows = result.get("rows", [])
                chart = None
                if rows:
                    chart = {
                        "type": "line",
                        "title": f"Évolution {metric} 2026",
                        "labels": [r[0] for r in rows],
                        "values": [r[1] for r in rows]
                    }
                
                return {
                    "mode": "tool_call",
                    "answer": answer,
                    "tool_used": detected_tool,
                    "tool_params": {"metric": metric},
                    "columns": result.get("columns"),
                    "rows": rows,
                    "row_count": len(rows),
                    "chart": chart,
                    "from_cache": False
                }
        
        elif detected_tool == "email_generator":
            # Déterminer le type d'email
            if "rapport" in question_lower or "quotidien" in question_lower:
                email_type = "report"
            elif "alerte" in question_lower or "critique" in question_lower:
                email_type = "alert"
            elif "synthèse" in question_lower or "hebdomadaire" in question_lower:
                email_type = "summary"
            else:
                email_type = "report"
            
            result = tool_handler.execute_tool("email_generator", {"email_type": email_type})
            
            if result.get("success"):
                return {
                    "mode": "tool_call",
                    "answer": f"Email généré : {result['subject']}\n\n{result['body']}",
                    "tool_used": detected_tool,
                    "tool_params": {"email_type": email_type},
                    "from_cache": False
                }
        
        elif detected_tool == "alert_generator":
            alert_type = "kpi"
            result = tool_handler.execute_tool("alert_generator", {"alert_type": alert_type})
            
            if result.get("success"):
                alerts = result.get("alerts", [])
                if alerts:
                    alert_text = "\n".join([f"- {a['type']}: {a['entity']} ({a['value']}) [{a['severity']}]" for a in alerts[:5]])
                    return {
                        "mode": "tool_call",
                        "answer": f"Alertes détectées ({result['total_alerts']}):\n{alert_text}",
                        "tool_used": detected_tool,
                        "tool_params": {"alert_type": alert_type},
                        "from_cache": False
                    }
                else:
                    return {
                        "mode": "tool_call",
                        "answer": "Aucune alerte critique détectée. Le système fonctionne normalement.",
                        "tool_used": detected_tool,
                        "tool_params": {"alert_type": alert_type},
                        "from_cache": False
                    }
        
        elif detected_tool == "summary_tool":
            result = tool_handler.execute_tool("summary_tool", {})
            
            if result.get("success"):
                kpis = result.get("kpis", {})
                status = result.get("status", "normal")
                kpi_text = "\n".join([f"- {k}: {v}" for k, v in kpis.items()])
                
                status_emoji = "✅" if status == "normal" else "⚠️" if status == "attention_requise" else "🚨"
                
                return {
                    "mode": "tool_call",
                    "answer": f"Résumé système ({result['timestamp']}):\n{status_emoji} Statut: {status}\n\nKPIs:\n{kpi_text}",
                    "tool_used": detected_tool,
                    "tool_params": {},
                    "from_cache": False
                }
        
        elif detected_tool == "prediction_tool":
            # Déterminer le type de prédiction
            if "pnb" in question_lower:
                prediction_type = "pnb"
            elif "npl" in question_lower:
                prediction_type = "npl"
            else:
                prediction_type = "pnb"  # Default
            
            result = tool_handler.execute_tool("prediction_tool", {"prediction_type": prediction_type})
            
            if result.get("success"):
                return {
                    "mode": "tool_call",
                    "answer": f"Prédiction {result['prediction_type']} pour {result['period']} : {result['predicted_value']} MAD (actuel: {result['current_value']} MAD, {result.get('growth_rate', 0):+}% de variation). Méthode: {result['method']}.",
                    "tool_used": detected_tool,
                    "tool_params": {"prediction_type": prediction_type},
                    "from_cache": False
                }
    
    except Exception as e:
        # En cas d'erreur dans le tool calling, on retourne None pour laisser le système standard traiter
        pass
    
    return None

class ToolCallHandler:
    """Gestionnaire d'outils pour le Tool Calling avancé."""
    
    def __init__(self, db: Session):
        self.db = db
        self.tools = {
            "sql_analyzer": self._sql_analyzer_tool,
            "kpi_calculator": self._kpi_calculator_tool,
            "comparison_tool": self._comparison_tool,
            "ranking_tool": self._ranking_tool,
            "trend_analyzer": self._trend_analyzer_tool,
            "email_generator": self._email_generator_tool,
            "alert_generator": self._alert_generator_tool,
            "summary_tool": self._summary_tool,
            "prediction_tool": self._prediction_tool,
        }
    
    def _sql_analyzer_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Outil d'analyse SQL générique."""
        sql = params.get("sql", "")
        if not sql:
            return {"error": "SQL requis"}
        
        try:
            columns, rows = execute_read_only_sql(sql)
            return {
                "success": True,
                "columns": columns,
                "rows": rows,
                "row_count": len(rows)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _kpi_calculator_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Outil de calcul de KPIs bancaires."""
        kpi_type = params.get("kpi_type", "")
        
        kpi_queries = {
            "pnb_total": "SELECT COALESCE(SUM(pnb), 0) AS pnb_total FROM fact_performance",
            "npl_average": "SELECT ROUND(AVG(npl_ratio), 2) AS npl_avg FROM fact_performance",
            "nim_average": "SELECT ROUND(AVG(nim), 2) AS nim_avg FROM fact_performance",
            "total_encours": "SELECT COALESCE(SUM(montant), 0) AS total_encours FROM fact_engagement",
            "high_risk_clients": "SELECT COUNT(*) AS high_risk_count FROM dim_client WHERE score_actuel < 40",
            "satisfaction_avg": "SELECT ROUND(AVG(note_satisfaction_client), 2) AS satisfaction_avg FROM fact_qualite",
        }
        
        if kpi_type not in kpi_queries:
            return {"error": f"KPI inconnu: {kpi_type}. Options: {list(kpi_queries.keys())}"}
        
        try:
            columns, rows = execute_read_only_sql(kpi_queries[kpi_type])
            if rows and len(rows) > 0:
                return {
                    "success": True,
                    "kpi_type": kpi_type,
                    "value": rows[0][0] if len(rows[0]) > 0 else None,
                    "unit": "MAD" if "pnb" in kpi_type or "encours" in kpi_type else "%" if "ratio" in kpi_type else ""
                }
            return {"error": "Pas de données"}
        except Exception as e:
            return {"error": str(e)}
    
    def _comparison_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Outil de comparaison entre entités."""
        entity_type = params.get("entity_type", "agence")  # agence, region, etc.
        metric = params.get("metric", "pnb")
        
        comparison_queries = {
            "agence_pnb": """
                SELECT da.nom AS agence, COALESCE(SUM(fp.pnb), 0) AS pnb_total 
                FROM fact_performance fp 
                JOIN dim_agence da ON fp.agence_id = da.agence_id 
                GROUP BY da.nom 
                ORDER BY pnb_total DESC 
                LIMIT 10
            """,
            "agence_npl": """
                SELECT da.nom AS agence, ROUND(AVG(fp.npl_ratio), 2) AS npl_avg 
                FROM fact_performance fp 
                JOIN dim_agence da ON fp.agence_id = da.agence_id 
                GROUP BY da.nom 
                ORDER BY npl_avg DESC 
                LIMIT 10
            """,
        }
        
        query_key = f"{entity_type}_{metric}"
        if query_key not in comparison_queries:
            return {"error": f"Comparaison non disponible: {query_key}"}
        
        try:
            columns, rows = execute_read_only_sql(comparison_queries[query_key])
            return {
                "success": True,
                "comparison_type": query_key,
                "columns": columns,
                "rows": rows,
                "row_count": len(rows)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _ranking_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Outil de classement."""
        ranking_type = params.get("ranking_type", "top_agences_pnb")
        limit = params.get("limit", 5)
        
        ranking_queries = {
            "top_agences_pnb": f"""
                SELECT da.nom AS agence, COALESCE(SUM(fp.pnb), 0) AS total_pnb 
                FROM fact_performance fp 
                JOIN dim_agence da ON fp.agence_id = da.agence_id 
                GROUP BY da.nom 
                ORDER BY total_pnb DESC 
                LIMIT {limit}
            """,
            "bottom_agences_npl": f"""
                SELECT da.nom AS agence, ROUND(AVG(fp.npl_ratio), 2) AS npl_avg 
                FROM fact_performance fp 
                JOIN dim_agence da ON fp.agence_id = da.agence_id 
                GROUP BY da.nom 
                ORDER BY npl_avg ASC 
                LIMIT {limit}
            """,
        }
        
        if ranking_type not in ranking_queries:
            return {"error": f"Classement non disponible: {ranking_type}"}
        
        try:
            columns, rows = execute_read_only_sql(ranking_queries[ranking_type])
            return {
                "success": True,
                "ranking_type": ranking_type,
                "columns": columns,
                "rows": rows,
                "row_count": len(rows)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _trend_analyzer_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Outil d'analyse de tendance temporelle."""
        metric = params.get("metric", "pnb")
        period = params.get("period", "2026")
        
        trend_queries = {
            "pnb_monthly": f"""
                SELECT dd.annee_mois, COALESCE(SUM(fp.pnb), 0) AS pnb 
                FROM fact_performance fp 
                JOIN dim_date dd ON fp.date_id = dd.date_id 
                WHERE dd.annee = {period}
                GROUP BY dd.annee_mois 
                ORDER BY dd.annee_mois
            """,
            "npl_monthly": f"""
                SELECT dd.annee_mois, ROUND(AVG(fp.npl_ratio), 2) AS npl_avg 
                FROM fact_performance fp 
                JOIN dim_date dd ON fp.date_id = dd.date_id 
                WHERE dd.annee = {period}
                GROUP BY dd.annee_mois 
                ORDER BY dd.annee_mois
            """,
        }
        
        query_key = f"{metric}_monthly"
        if query_key not in trend_queries:
            return {"error": f"Tendance non disponible: {query_key}"}
        
        try:
            columns, rows = execute_read_only_sql(trend_queries[query_key])
            
            # Analyse de tendance simple
            if rows and len(rows) >= 2:
                first_val = rows[0][1] if len(rows[0]) > 1 else 0
                last_val = rows[-1][1] if len(rows[-1]) > 1 else 0
                if first_val > 0:
                    change_pct = ((last_val - first_val) / first_val) * 100
                    trend = "en hausse" if change_pct > 5 else "en baisse" if change_pct < -5 else "stable"
                else:
                    trend = "indéterminable"
                    change_pct = 0
            else:
                trend = "insuffisamment de données"
                change_pct = 0
            
            return {
                "success": True,
                "trend_type": query_key,
                "columns": columns,
                "rows": rows,
                "row_count": len(rows),
                "trend_analysis": {
                    "trend": trend,
                    "change_percentage": round(change_pct, 2)
                }
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _email_generator_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Génère un contenu d'email professionnel basé sur les données."""
        email_type = params.get("email_type", "report")
        recipient = params.get("recipient", "direction@company.com")
        
        email_templates = {
            "report": {
                "subject": "Rapport Analytique Quotidien",
                "body": "Bonjour, veuillez trouver ci-joint le rapport analytique quotidien incluant les KPIs principaux et l'état des risques."
            },
            "alert": {
                "subject": "Alerte KPI Critique",
                "body": "Alerte : Un ou plusieurs indicateurs critiques ont dépassé les seuils définis. Action immédiate requise."
            },
            "summary": {
                "subject": "Synthèse Hebdomadaire",
                "body": "Synthèse de l'activité hebdomadaire : performance, risque et satisfaction client."
            }
        }
        
        if email_type not in email_templates:
            return {"error": f"Type d'email inconnu: {email_type}"}
        
        try:
            # Récupérer les données KPI pour l'email
            kpi_result = self._kpi_calculator_tool({"kpi_type": "pnb_total"})
            
            template = email_templates[email_type]
            kpi_value = kpi_result.get("value", "N/A") if kpi_result.get("success") else "N/A"
            
            email_content = {
                "success": True,
                "email_type": email_type,
                "recipient": recipient,
                "subject": template["subject"],
                "body": f"{template['body']}\n\nPNB Actuel: {kpi_value} MAD\n\nCordialement,\nL'équipe Analytics",
                "kpi_value": kpi_value
            }
            
            return email_content
        except Exception as e:
            return {"error": str(e)}
    
    def _alert_generator_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Génère des alertes basées sur les seuils critiques."""
        alert_type = params.get("alert_type", "kpi")
        
        alert_queries = {
            "kpi": {
                "npl_critical": "SELECT da.nom, ROUND(AVG(fp.npl_ratio), 2) AS npl_avg FROM fact_performance fp JOIN dim_agence da ON fp.agence_id = da.agence_id GROUP BY da.nom HAVING AVG(fp.npl_ratio) > 10",
                "low_performance": "SELECT da.nom, COALESCE(SUM(fp.pnb), 0) AS total_pnb FROM fact_performance fp JOIN dim_agence da ON fp.agence_id = da.agence_id GROUP BY da.nom HAVING COALESCE(SUM(fp.pnb), 0) < 1000000"
            }
        }
        
        if alert_type not in alert_queries:
            return {"error": f"Type d'alerte inconnu: {alert_type}"}
        
        try:
            alerts = []
            for alert_name, query in alert_queries[alert_type].items():
                columns, rows = execute_read_only_sql(query)
                if rows:
                    for row in rows:
                        alerts.append({
                            "type": alert_name,
                            "entity": row[0],
                            "value": row[1],
                            "severity": "critique" if "critical" in alert_name else "warning"
                        })
            
            return {
                "success": True,
                "alert_type": alert_type,
                "alerts": alerts,
                "total_alerts": len(alerts)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _summary_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Génère un résumé rapide de l'état du système."""
        try:
            # Récupérer plusieurs KPIs
            pnb_result = self._kpi_calculator_tool({"kpi_type": "pnb_total"})
            npl_result = self._kpi_calculator_tool({"kpi_type": "npl_average"})
            
            summary = {
                "success": True,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "kpis": {},
                "status": "normal"
            }
            
            if pnb_result.get("success"):
                summary["kpis"]["pnb_total"] = pnb_result.get("value")
            
            if npl_result.get("success"):
                summary["kpis"]["npl_average"] = npl_result.get("value")
                if npl_result.get("value", 0) > 8:
                    summary["status"] = "attention_requise"
                if npl_result.get("value", 0) > 12:
                    summary["status"] = "critique"
            
            return summary
        except Exception as e:
            return {"error": str(e)}
    
    def _prediction_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Outil de prédiction simple basé sur les tendances historiques."""
        prediction_type = params.get("prediction_type", "pnb")
        
        try:
            if prediction_type == "pnb":
                # Récupérer les données historiques pour la prédiction
                columns, rows = execute_read_only_sql(
                    "SELECT dd.annee_mois, COALESCE(SUM(fp.pnb), 0) AS pnb "
                    "FROM fact_performance fp "
                    "JOIN dim_date dd ON fp.date_id = dd.date_id "
                    "WHERE dd.annee >= 2025 "
                    "GROUP BY dd.annee_mois "
                    "ORDER BY dd.annee_mois "
                    "LIMIT 6"
                )
                
                if len(rows) >= 2:
                    # Prédiction simple : moyenne de croissance des 3 derniers mois
                    values = [float(r[1]) for r in rows[-3:]]
                    if values:
                        avg_growth = (values[-1] - values[0]) / len(values) if values[0] > 0 else 0
                        last_value = values[-1]
                        predicted = last_value * (1 + avg_growth)
                        
                        next_month = rows[-1][0] if rows else "2026-09"
                        return {
                            "success": True,
                            "prediction_type": "pnb",
                            "predicted_value": round(predicted, 2),
                            "current_value": round(last_value, 2),
                            "growth_rate": round(avg_growth * 100, 2),
                            "period": f"Prochain mois ({next_month})",
                            "method": "Croissance moyenne sur 3 derniers mois"
                        }
            
            elif prediction_type == "npl":
                columns, rows = execute_read_only_sql(
                    "SELECT dd.annee_mois, ROUND(AVG(fp.npl_ratio), 2) AS npl "
                    "FROM fact_performance fp "
                    "JOIN dim_date dd ON fp.date_id = dd.date_id "
                    "WHERE dd.annee >= 2025 "
                    "GROUP BY dd.annee_mois "
                    "ORDER BY dd.annee_mois "
                    "LIMIT 6"
                )
                
                if len(rows) >= 2:
                    values = [float(r[1]) for r in rows[-3:]]
                    if values:
                        avg_change = (values[-1] - values[0]) / len(values)
                        last_value = values[-1]
                        predicted = last_value + avg_change
                        
                        next_month = rows[-1][0] if rows else "2026-09"
                        
                        return {
                            "success": True,
                            "prediction_type": "npl",
                            "predicted_value": round(predicted, 2),
                            "current_value": round(last_value, 2),
                            "trend": "hausse" if avg_change > 0 else "baisse",
                            "period": f"Prochain mois ({next_month})",
                            "method": "Tendance moyenne sur 3 derniers mois"
                        }
            
            return {
                "error": f"Prediction non disponible pour {prediction_type} ou données insuffisantes"
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def execute_tool(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Exécute un outil spécifique."""
        if tool_name not in self.tools:
            return {"error": f"Outil inconnu: {tool_name}. Options: {list(self.tools.keys())}"}
        
        return self.tools[tool_name](params)


def _check_temporal_tool(question: str) -> Optional[Dict[str, Any]]:
    """Tool contextuel de date : repond aux questions sur la date et periode courante."""
    from datetime import date as _date
    import locale as _locale

    q_clean = question.lower().strip()
    
    # Mots-clés bancaires qui indiquent que la question n'est PAS purement temporelle
    # Si ces mots sont présents, on laisse le LLM traiter la question normalement
    banking_keywords = [
        r"\bpnb\b", r"\bproduit\s+net\s+bancaire\b", r"\bencours\b", r"\bcr[ée]dit\b",
        r"\bclient\b", r"\bagence\b", r"\bperformance\b", r"\brisque\b", 
        r"\bengagement\b", r"\bmontant\b", r"\bcaisse\b", r"\bepargne\b",
        r"\bdep[ôo]t\b", r"\bpret\b", r"\btaux\b", r"\bbenefice\b", r"\bchiffre\b"
    ]
    
    # Si la question contient des mots-clés bancaires, ce n'est pas une question purement temporelle
    if any(re.search(k, q_clean) for k in banking_keywords):
        return None
    
    date_patterns = [
        r"\bquelle?\s+(est\s+)?(la\s+)?date(\s+d'aujourd'hui)?\b",  # quelle/quel
        r"\bquel\s+est\s+le\s+(jour|date)\b",
        r"\bquel\s+jour\s+sommes[- ]nous\b",
        r"\bdate\s+du\s+jour\b",
        r"\bdate\s+(d'aujourd'hui|daujourdhui)\b",
        r"\ben\s+quelle\s+ann[eé]e\s+sommes[- ]nous\b",
        r"\bquel\s+est\s+le\s+mois\s+actuel\b",
        r"\bperiode\s+actuelle\b",
        r"\bquand\s+sommes[- ]nous\b",
        r"\bon\s+est\s+(le\s+)?quel(le)?\s+(jour|date|mois)?\b",
        r"\btoday\b",
        r"\bdate\s+actuelle\b",
        # Questions futures
        r"\bquelle\s+sera\s+la\s+date\s+demain\b",
        r"\bdate\s+demain\b",
        r"\bquel\s+jour\s+sera\s+demain\b",
        r"\bdemain\s+sera\s+le\b",
    ]
    if any(re.search(p, q_clean) for p in date_patterns):
        from datetime import timedelta as _timedelta
        today = _date.today()
        jours_fr = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
        mois_fr = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                   "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
        jour_nom = jours_fr[today.weekday()]
        mois_nom = mois_fr[today.month]
        trimestre = (today.month - 1) // 3 + 1
        date_str = f"{jour_nom} {today.day} {mois_nom} {today.year}"
        
        # Gestion des questions futures
        if "demain" in q_clean:
            tomorrow = today + _timedelta(days=1)
            jour_demain = jours_fr[tomorrow.weekday()]
            date_demain = f"{jour_demain} {tomorrow.day} {mois_fr[tomorrow.month]} {tomorrow.year}"
            return {
                "mode": "date_tool",
                "answer": f"Demain sera le **{date_demain}**.",
                "sql": None,
                "sql_explanation": "Calcul de la date future +1 jour.",
                "columns": None,
                "rows": None,
                "row_count": 0,
                "chart": None,
                "tables": [],
                "duration_ms": 2,
            }
        
        return {
            "mode": "date_tool",
            "answer": f"Nous sommes le **{date_str}** (T{trimestre} {today.year}).",
            "sql": None,
            "sql_explanation": "Appel de l'outil système 'get_current_datetime'.",
            "columns": None,
            "rows": None,
            "row_count": 0,
            "chart": None,
            "tables": [],
            "duration_ms": 2,
        }
    return None



def _log_query(
    db: Session,
    user: User,
    question: str,
    mode: str,
    sql: Optional[str],
    row_count: int,
    duration_ms: int,
    status: str,
    error: Optional[str],
    tables: List[str],
    answer: Optional[str],
) -> None:
    from app.models.ai import AIQueryLog

    db.add(AIQueryLog(
        user_id=user.id,
        user_nom=user.nom,
        question=question,
        mode=mode,
        sql_generated=sql,
        row_count=row_count,
        duration_ms=duration_ms,
        status=status,
        error=error,
        tables=",".join(tables) if tables else None,
        answer=answer,
    ))
    db.commit()


def _generate_plan(
    llm: LLMClient, question: str, schema_txt: str, hint_error: Optional[str] = None
) -> Dict[str, Any]:
    prompt = f"Question de l'utilisateur : {question}\n"
    if hint_error:
        prompt += (
            f"\nLa requete precedente a echoue avec l'erreur : {hint_error}\n"
            "Corrige la requete en t'aidant du schema fourni."
        )
    return llm.complete_json(
        prompt,
        system=_build_system_sql_prompt(schema_txt),
        temperature=0.0,
    )


def _generate_answer(
    llm: LLMClient,
    question: str,
    sql: str,
    columns: List[str],
    rows: List[List[Any]],
    chart_info: Optional[Dict[str, Any]] = None,
) -> str:
    preview_rows = rows[:10]
    entete = " | ".join(str(c) for c in columns) if columns else ""
    preview = "\n".join(" | ".join(str(v) for v in row) for row in preview_rows)

    # CAS PARTICULIER : une seule ligne, une seule colonne (COUNT, SUM global).
    # BUG CORRIGE - total_val etait calcule sur r[1], colonne INEXISTANTE ici.
    # Le modele lisait "Total : 0,00 MAD" et repondait "0,00 MAD" ou "aucun
    # resultat" alors que la base avait bien renvoye une valeur.
    if len(rows) == 1 and len(rows[0]) == 1:
        valeur = rows[0][0]
        prompt_unique = (
            f"Question : {question}\n"
            f"RESULTAT EXACT retourne par la base : {valeur}\n"
            f"(nom de la colonne : {entete})\n\n"
            "Annonce cette valeur telle quelle, en une phrase. "
            "Ne dis JAMAIS qu il n y a aucun resultat : la base a bien repondu."
        )
        rep = llm.complete(prompt_unique, system=_get_summary_prompt(), temperature=0.1).strip()
        return _corriger_vocabulaire(rep)

    # Cas general : les agregats ne portent que sur la 2e colonne quand elle
    # est numerique (format habituel "libelle | valeur").
    valeurs = [_as_float(r[1]) for r in rows if len(r) > 1]
    valeurs = [v for v in valeurs if v is not None]
    total_val = sum(valeurs) if valeurs else 0
    avg_val = total_val / len(valeurs) if valeurs else 0
    
    # Analyse de tendance pour les series temporelles
    tendance = ""
    if len(valeurs) >= 3 and "annee_mois" in str(columns).lower():
        # Détecter tendance simple
        premiere = valeurs[0]
        derniere = valeurs[-1]
        if derniere > premiere * 1.05:
            tendance = "Tendance : en hausse. "
        elif derniere < premiere * 0.95:
            tendance = "Tendance : en baisse. "
        else:
            tendance = "Tendance : stable. "
    
    # Analyse de classement
    classement = ""
    if len(valeurs) >= 2 and len(rows) >= 2:
        max_val = max(valeurs)
        max_idx = valeurs.index(max_val)
        if max_idx < len(rows) and len(rows[max_idx]) > 0:
            leader = str(rows[max_idx][0])
            classement = f"Leader : {leader} avec {max_val:,.2f} MAD. "
    
    ligne_agg = f"Moyenne : {avg_val:,.2f} | Total : {total_val:,.2f}\n" if valeurs else ""
    contexte_analytique = f"{tendance}{classement}" if (tendance or classement) else ""
    
    prompt = (
        f"Question : {question}\n"
        f"Nombre de lignes : {len(rows)}\n"
        f"{ligne_agg}"
        f"Colonnes : {entete}\n"
        f"Donnees reelles :\n{preview}\n"
        f"Graphique genere : {'Oui (' + chart_info.get('type') + ')' if chart_info else 'Non'}\n"
        f"{contexte_analytique}\n"
        "Redige 1 a 2 phrases basees UNIQUEMENT sur ces donnees reelles. "
        "Inclus l'analyse de tendance ou de classement si disponible."
    )
    rep = llm.complete(prompt, system=_get_summary_prompt(), temperature=0.1).strip()
    return _corriger_vocabulaire(rep)


# Faux amis bancaires que le modele repete malgre la consigne du prompt.
# Un prompt est une suggestion ; ce filtre, lui, est deterministe.
_CORRECTIONS_METIER = [
    ("Produit National Brut", "Produit Net Bancaire"),
    ("produit national brut", "produit net bancaire"),
    ("Produit Interieur Brut", "Produit Net Bancaire"),
    ("Produit Intérieur Brut", "Produit Net Bancaire"),
]


def _corriger_vocabulaire(texte: str) -> str:
    """PNB = Produit NET BANCAIRE, jamais "National Brut" (indicateur macro).

    C est une erreur qu un banquier repere immediatement en soutenance.
    """
    if not texte:
        return texte
    for faux, correct in _CORRECTIONS_METIER:
        texte = texte.replace(faux, correct)
    return texte


def answer_question(db: Session, user: User, question: str) -> Dict[str, Any]:
    start = time.perf_counter()

    # 0. Vérification du cache pour les questions fréquentes
    cache_key = _get_cache_key(question, user.id)
    cached_response = _get_from_cache(cache_key)
    if cached_response:
        # Retourner la réponse en cache avec un indicateur
        cached_response["from_cache"] = True
        return cached_response

    # 0.5. Vérification du Tool Calling avancé
    tool_result = _check_tool_calling(question, db)
    if tool_result:
        duration_ms = int((time.perf_counter() - start) * 1000)
        tool_result["duration_ms"] = duration_ms
        _log_query(db, user, question, "tool_call", None, tool_result.get("row_count", 0), duration_ms, "success", None, [], tool_result.get("answer", ""))
        _set_cache(cache_key, tool_result)
        return tool_result

    # 1. Verification du Tool Contexte Temporel
    date_tool_res = _check_temporal_tool(question)
    if date_tool_res:
        _log_query(db, user, question, "date_tool", None, 0, 5, "success", None, [], date_tool_res["answer"])
        _set_cache(cache_key, date_tool_res)  # Mettre en cache même les réponses temporelles
        return date_tool_res

    schema_txt = format_schema_for_prompt(get_gold_schema())
    llm = None
    try:
        from app.services.rag.llm import get_llm
        llm = get_llm()
    except RuntimeError as exc:
        return {
            "mode": "error",
            "answer": f"Assistant indisponible : {exc}",
            "sql": None, "sql_explanation": None,
            "columns": None, "rows": None, "row_count": 0,
            "chart": None, "tables": [], "duration_ms": 0,
            "degraded": True,
        }

    plan: Dict[str, Any] = {}
    columns: List[str] = []
    rows: List[List[Any]] = []
    sql: Optional[str] = None
    error: Optional[str] = None

    for attempt in range(3):
        try:
            plan = _generate_plan(llm, question, schema_txt, hint_error=error)
        except Exception as exc:
            error = f"Le modele n'a pas produit une reponse exploitable : {exc}"
            continue

        if plan.get("mode") == "oob":
            answer = plan.get("answer") or (
                "Cette question depasse le perimetre des donnees bancaires disponibles. "
                "Je peux analyser pour vous le PNB, les encours de credits, le portefeuille clients, le risque et les agences Saham Bank."
            )
            duration_ms = int((time.perf_counter() - start) * 1000)
            _log_query(db, user, question, "oob", None, 0, duration_ms, "no_sql", None, [], answer)
            return {
                "mode": "oob", "answer": answer,
                "sql": None, "sql_explanation": plan.get("sql_explanation"),
                "columns": None, "rows": None, "row_count": 0,
                "chart": None, "tables": [], "duration_ms": duration_ms,
        "degraded": bool(getattr(llm, "degraded", False)),
            }

        sql = plan.get("sql")
        if not sql:
            error = "Le modele n'a pas genere de requete SQL."
            continue
        try:
            columns, rows = execute_read_only_sql(sql)
            error = None
            break
        except Exception as exc:
            error = str(exc)

    duration_ms = int((time.perf_counter() - start) * 1000)
    tables = _extract_tables(sql) if sql else []

    if error:
        # Gestion améliorée des erreurs avec suggestions
        suggestion = _generer_suggestion_erreur(question, error)
        message_erreur = f"Je n'ai pas pu exécuter cette analyse. {suggestion}"
        
        _log_query(db, user, question, "sql", sql, 0, duration_ms, "error", error, tables, None)
        return {
            "mode": "error",
            "answer": message_erreur,
            "sql": sql, "sql_explanation": plan.get("sql_explanation"),
            "columns": None, "rows": None, "row_count": 0,
            "chart": None, "tables": tables, "duration_ms": duration_ms,
        "degraded": bool(getattr(llm, "degraded", False)),
        }

    chart_type = _detect_chart_type(columns, rows, plan.get("chart_type"), question)
    chart = _build_chart(columns, rows, chart_type, question)

    answer = ""
    try:
        answer = _generate_answer(llm, question, sql, columns, rows, chart)
    except Exception:
        answer = "Voici l'analyse demandee."

    _log_query(db, user, question, "sql", sql, len(rows), duration_ms, "success", None, tables, answer)
    
    response = {
        "mode": "sql",
        "answer": answer,
        "sql": sql,
        "sql_explanation": plan.get("sql_explanation"),
        "columns": columns,
        "rows": rows[: settings.SQL_MAX_ROWS],
        "row_count": len(rows),
        "chart": chart,
        "tables": tables,
        "duration_ms": duration_ms,
        "degraded": bool(getattr(llm, "degraded", False)),
        "from_cache": False,
    }
    
    # Mettre en cache les réponses SQL réussies
    _set_cache(cache_key, response)
    return response
