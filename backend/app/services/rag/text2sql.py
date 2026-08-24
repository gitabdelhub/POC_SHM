"""
Service Text-to-SQL : transforme une question en français en requête SQL
exécutée en lecture seule sur le schéma Gold, puis génère une réponse
naturelle et détecte le type de graphe adapté (barres/ligne/camembert).

Flux :
  1. Le LLM reçoit le schéma Gold + la question -> propose {mode, sql, ...}.
  2. La requête est validée (SELECT/WITH uniquement) puis exécutée en
     lecture seule stricte (voir vector_store.execute_read_only_sql).
  3. Un 2e appel LLM rédige la réponse en français à partir des VRAIS
     résultats (rien de codé en dur).
  4. Chaque question est journalisée dans ai_query_log (page Admin).
"""

import re
import time
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.services.rag.llm import LLMClient
from app.services.rag.vector_store import (
    execute_read_only_sql,
    format_schema_for_prompt,
    get_gold_schema,
)

SYSTEM_SQL_PROMPT = """\
Tu es SahamAI, l'assistant analytique expert de Saham Bank (banque marocaine).
Tu réponds aux questions sur la banque en générant des requêtes SQL uniquement à partir du schéma "Gold" ci-dessous.

{SCHEMA}

Règles de modélisation et de calcul :
1. PNB (Produit Net Bancaire) :
   - Le PNB mensuel par agence se trouve dans `fact_performance.pnb` (ex: `SELECT COALESCE(SUM(pnb), 0) AS pnb_total_mad FROM fact_performance`).
   - Pour le PNB global ou actuel, fais la somme `COALESCE(SUM(pnb), 0) AS pnb_total`.
   - Pour le PNB par mois/trimestre, joins `fact_performance` avec `dim_date` sur `date_id` (format YYYYMM01, ex: `dim_date.annee_mois`).
2. Crédits et Engagements :
   - Les encours de crédits sont dans `fact_engagement.montant` ou `fact_performance.encours_credits`.
   - Les types de crédit se trouvent dans `dim_type_credit.libelle` (jointure `fact_engagement.type_credit_id = dim_type_credit.type_credit_id`).
3. Clients et Risque :
   - Les clients sont dans `dim_client` (`encours_actuel`, `score_actuel`, `statut_actuel`).
   - Le risque est suivi dans `fact_risque` (`score_risque`, `classe_risque`, `npl_flag`).
4. Toujours utiliser `COALESCE(...)` sur les agrégats (`SUM`, `AVG`, `COUNT`) pour éviter les résultats NULL.

Règles de réponse :
- Génère TOUJOURS une seule requête SELECT (jamais INSERT, UPDATE, DELETE, ALTER...). Pas de point-virgule final.
- Réponds UNIQUEMENT sous forme d'un objet JSON valide au format :
  {{"mode": "sql", "sql": "<requete>", "sql_explanation": "<explication>", "chart_type": "bar|line|pie|none"}}
- Si la question est hors-sujet bancaire (météo, football, etc.), renvoie :
  {{"mode": "oob", "answer": "Je suis SahamAI, l'assistant dédié de Saham Bank. Je peux vous informer sur le PNB, les crédits, le risque et les agences. Comment puis-je vous aider sur vos données bancaires ?", "sql": null, "sql_explanation": null, "chart_type": "none"}}
- chart_type: "none" pour une valeur unique ou une liste simple, "bar" ou "pie" (<= 8 éléments) pour des comparaisons, "line" pour des séries temporelles.
"""

SYSTEM_SUMMARY_PROMPT = """Tu es SahamAI, l'assistant analytique de Saham Bank.
Tu t'adresses a des utilisateurs METIER (directeurs, charges d'affaires), PAS a des informaticiens.

Redige une reponse en francais, claire et naturelle, comme un analyste qui explique
un resultat a son directeur.

REGLE ABSOLUE SUR LES CHIFFRES - c'est le point le plus important :
- Donne TOUJOURS la valeur EXACTE retournee par la base, sans arrondir.
  L'utilisateur interroge l'assistant pour obtenir un chiffre juste, pas un ordre
  de grandeur : un ecart de quelques milliers de dirhams compte en pilotage bancaire.
- Separe les milliers par une espace pour que ce soit lisible :
  ecris "35 983 057,16 MAD" et non "35983057.16".
- Tu PEUX ajouter l'ordre de grandeur entre parentheses, en appui seulement :
  "35 983 057,16 MAD (environ 35,98 millions)".
  Mais la valeur exacte doit toujours apparaitre en premier.
- N'invente jamais un chiffre : recopie fidelement ce que renvoie la requete.

FORME DE LA REPONSE :
- Une valeur unique -> une phrase complete qui remet le chiffre dans son contexte.
  Exemple : "Le PNB total de la banque s'eleve a 35,98 millions MAD sur la periode."
- Une liste (par agence, par mois, par classe) -> une phrase d'introduction,
  puis OBLIGATOIREMENT une puce par ligne, au format exact :
      - Nom : valeur
      - Nom : valeur
  Chaque element sur SA PROPRE LIGNE, separee par un retour a la ligne.
  N'enumere JAMAIS les elements a la suite dans un seul paragraphe separe par
  des virgules : c'est illisible des qu'il y a plus de trois elements.
- Ajoute quand c'est pertinent une phrase d'analyse : l'ecart entre le premier et
  le dernier, une tendance, une concentration. C'est ce qui distingue une reponse
  utile d'un simple affichage de chiffres.
- Si le resultat est vide, dis-le simplement et suggere une reformulation.

NE MENTIONNE JAMAIS la requete SQL, les noms de tables ou de colonnes techniques.
Parle le langage de la banque : PNB, encours, agences, clients, risque.
"""



def _extract_tables(sql: str) -> List[str]:
    tables = re.findall(r"\b(?:from|join)\s+([a-z_][a-z0-9_]*)", sql, re.I)
    seen, out = set(), []
    for t in tables:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out


def _detect_chart_type(
    columns: List[str], rows: List[List[Any]], hint: Optional[str]
) -> str:
    if len(columns) < 2 or len(rows) < 2:
        return "none"
    values = [_as_float(r[1]) for r in rows]
    if not any(v is not None for v in values):
        return "none"
    if hint in ("bar", "line", "pie"):
        return hint
    first = str(rows[0][0])
    if re.match(r"^\d{4}-\d{2}", first):
        return "line"
    return "pie" if len(rows) <= 8 else "bar"


def _as_float(value: Any) -> Optional[float]:
    try:
        f = float(value)
        return f
    except (TypeError, ValueError):
        return None


def _build_chart(columns: List[str], rows: List[List[Any]], chart_type: str):
    if chart_type == "none" or len(columns) < 2 or not rows:
        return None
    labels = [str(r[0]) for r in rows]
    values = [round(f, 2) for f in (_as_float(r[1]) for r in rows) if f is not None]
    if len(values) != len(rows):
        return None
    return {"type": chart_type, "labels": labels, "values": values}


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
            f"\nLa requête précédente a échoué avec l'erreur : {hint_error}\n"
            "Corrige la requête en t'aidant du schéma fourni."
        )
    return llm.complete_json(
        prompt,
        system=SYSTEM_SQL_PROMPT.replace("{SCHEMA}", schema_txt),
        temperature=0.0,
    )


def _generate_answer(
    llm: LLMClient,
    question: str,
    sql: str,
    columns: List[str],
    rows: List[List[Any]],
) -> str:
    preview_rows = rows[:20]
    preview = "\n".join(" | ".join(str(v) for v in row) for row in preview_rows)
    prompt = (
        f"Question : {question}\n"
        f"Colonnes : {', '.join(columns)}\n"
        f"Résultats ({len(rows)} lignes) :\n{preview}"
    )
    return llm.complete(prompt, system=SYSTEM_SUMMARY_PROMPT, temperature=0.2).strip()


def answer_question(db: Session, user: User, question: str) -> Dict[str, Any]:
    start = time.perf_counter()
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
        }

    plan: Dict[str, Any] = {}
    columns: List[str] = []
    rows: List[List[Any]] = []
    sql: Optional[str] = None
    error: Optional[str] = None

    for attempt in range(3):
        try:
            plan = _generate_plan(llm, question, schema_txt, hint_error=error)
        except Exception as exc:  # JSON malformé, réponse vide...
            error = f"Le modèle n'a pas produit une réponse exploitable : {exc}"
            continue

        if plan.get("mode") == "oob":
            answer = plan.get("answer") or (
                "Cette question dépasse le périmètre des données disponibles. "
                "Je peux analyser les clients, crédits, risques et performances "
                "des agences Saham Bank."
            )
            duration_ms = int((time.perf_counter() - start) * 1000)
            _log_query(db, user, question, "oob", None, 0, duration_ms,
                       "no_sql", None, [], answer)
            return {
                "mode": "oob", "answer": answer,
                "sql": None, "sql_explanation": plan.get("sql_explanation"),
                "columns": None, "rows": None, "row_count": 0,
                "chart": None, "tables": [], "duration_ms": duration_ms,
            }

        sql = plan.get("sql")
        if not sql:
            error = "Le modèle n'a pas généré de requête SQL."
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
        _log_query(db, user, question, "sql", sql, 0, duration_ms,
                   "error", error, tables, None)
        return {
            "mode": "error",
            "answer": "Je n'ai pas pu exécuter cette analyse. "
                      f"Erreur : {error}",
            "sql": sql, "sql_explanation": plan.get("sql_explanation"),
            "columns": None, "rows": None, "row_count": 0,
            "chart": None, "tables": tables, "duration_ms": duration_ms,
        }

    chart_type = _detect_chart_type(columns, rows, plan.get("chart_type"))
    chart = _build_chart(columns, rows, chart_type)

    answer = ""
    try:
        answer = _generate_answer(llm, question, sql, columns, rows)
    except Exception:
        answer = "Voici les résultats de votre analyse."

    _log_query(db, user, question, "sql", sql, len(rows), duration_ms,
               "success", None, tables, answer)
    return {
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
    }
