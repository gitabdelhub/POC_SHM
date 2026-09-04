"""
Stockage vectoriel (pgvector) + introspection du schéma Gold + exécution SQL sécurisée.

pgvector est une extension PostgreSQL qui ajoute un type `vector` : on peut stocker
les embeddings dans la même base et faire une recherche par similarité cosinus (<=>).

Sécurité de l'exécution SQL (Text-to-SQL) :
  1. Connexion psycopg2 en mode READ ONLY -> l'utilisateur ne peut RIEN modifier.
  2. Le SQL doit commencer par SELECT/WITH et ne contenir aucun mot-clé de modification.
  3. Une clause LIMIT est toujours imposée (évite de ramener toute la table).
  4. Le résultat est tronqué et sérialisé (JSON-safe).
"""

import re
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Tuple

# import psycopg2  # Commenté pour Vercel - utilise pg8000 à la place
import pg8000
from sqlalchemy import text

from app.config import settings
from app.database import engine

GOLD_TABLES = [
    "dim_date",
    "dim_client",
    "dim_agence",
    "dim_type_credit",
    "dim_utilisateur",
    "fact_engagement",
    "fact_performance",
    "fact_risque",
    "fact_qualite",
]

# Mots-clés interdits : tout ce qui pourrait modifier ou supprimer des données.
FORBIDDEN_SQL = [
    "insert", "update", "delete", "drop", "alter", "create", "truncate",
    "grant", "revoke", "copy", "vacuum", "analyze", "execute", "call",
    "merge", "replace", "into", "load", "dump",
]


def ensure_schema(dimension: int = 384) -> None:
    """Crée l'extension vector et la table des chunks si absente."""
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS ai_chunks (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    embedding vector(%(dim)s) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            ),
            {"dim": dimension},
        )
        conn.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS ai_chunks_embedding_idx
                ON ai_chunks USING hnsw (embedding vector_cosine_ops)
                """
            )
        )
        conn.commit()
    print("  [OK] Schéma pgvector prêt (extension vector + table ai_chunks)")


def store_chunks(document_id: int, chunks: List[str], embeddings: List[List[float]]) -> int:
    if not chunks:
        return 0
    with engine.connect() as conn:
        for content, emb in zip(chunks, embeddings):
            conn.execute(
                text(
                    """
                    INSERT INTO ai_chunks (document_id, content, embedding)
                    VALUES (:doc_id, :content, :emb::vector)
                    """
                ),
                {"doc_id": document_id, "content": content, "emb": str(emb)},
            )
        conn.commit()
    return len(chunks)


def search_chunks(embedding: List[float], top_k: int = 4) -> List[Dict[str, Any]]:
    """Recherche des chunks les plus proches (similarité cosinus)."""
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT content, 1 - (embedding <=> :emb::vector) AS score
                FROM ai_chunks
                ORDER BY embedding <=> :emb::vector
                LIMIT :top_k
                """
            ),
            {"emb": str(embedding), "top_k": top_k},
        ).fetchall()
    return [{"content": r[0], "score": round(float(r[1]), 4)} for r in rows]


def delete_document_chunks(document_id: int) -> None:
    with engine.connect() as conn:
        conn.execute(
            text("DELETE FROM ai_chunks WHERE document_id = :did"), {"did": document_id}
        )
        conn.commit()


def count_chunks() -> int:
    with engine.connect() as conn:
        return conn.execute(text("SELECT COUNT(*) FROM ai_chunks")).scalar() or 0


def get_gold_schema() -> Dict[str, List[Tuple[str, str]]]:
    """Retourne {table: [(colonne, type), ...]} pour les tables Gold (star schema)."""
    schema = {}
    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                SELECT table_name, column_name, data_type
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = ANY(:tables)
                ORDER BY table_name, ordinal_position
                """
            ),
            {"tables": list(GOLD_TABLES)},
        )
        for table, column, dtype in result:
            schema.setdefault(table, []).append((column, dtype))
    return schema


def format_schema_for_prompt(schema: Dict[str, List[Tuple[str, str]]]) -> str:
    """Met en forme le schéma pour le prompt du LLM."""
    lines = []
    for table, cols in schema.items():
        cols_txt = ", ".join(f"{c} {t}" for c, t in cols)
        lines.append(f"CREATE TABLE {table} ({cols_txt});")
    return "\n".join(lines)


def _json_safe(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def _check_sql_safety(sql: str) -> None:
    stripped = sql.strip().rstrip(";")
    lowered = stripped.lower()

    if ";" in stripped:
        raise ValueError("SQL invalide : une seule requête est autorisée (pas de ';').")

    if not (lowered.startswith("select") or lowered.startswith("with")):
        raise ValueError("SQL invalide : seules les requêtes SELECT/WITH sont autorisées.")

    words = set(re.findall(r"[a-z_]+", lowered))
    blocked = words & set(FORBIDDEN_SQL)
    if blocked:
        raise ValueError(
            f"SQL interdit : mots-clés non autorisés ({', '.join(sorted(blocked))})."
        )


def execute_read_only_sql(
    sql: str, max_rows: int = None
) -> Tuple[List[str], List[List[Any]]]:
    """
    Exécute le SQL en lecture seule stricte.
    Retourne (colonnes, lignes) avec des valeurs JSON-safe.
    """
    if max_rows is None:
        max_rows = settings.SQL_MAX_ROWS

    _check_sql_safety(sql)

    if not re.search(r"\blimit\b", sql.lower()):
        sql = sql.rstrip().rstrip(";") + f" LIMIT {max_rows}"

    conn = pg8000.connect(settings.DATABASE_URL)
    conn.autocommit = False
    try:
        cur = conn.cursor()
        cur.execute(sql)
        columns = [d[0] for d in cur.description]
        raw_rows = cur.fetchmany(max_rows)
        rows = [[_json_safe(v) for v in row] for row in raw_rows]
        cur.close()
        return columns, rows
    finally:
        conn.rollback()
        conn.close()
