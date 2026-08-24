"""
Routeur SahamAI : chatbot analytique en langage naturel.

POST /ai/ask   -> question en français -> réponse + SQL + tableau + graphe,
                  journalisée dans ai_query_log (page Admin).
GET  /ai/logs  -> historique des questions posées (pour la console admin).

Protégé par JWT : il faut être connecté (n'importe quel rôle peut poser
une question, mais seul ADMIN/DG voit le log complet).
"""

from typing import Any, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import engine, get_db
from app.models.user import User
from app.services.rag.text2sql import answer_question

router = APIRouter(prefix="/ai", tags=["SahamAI"])


class AskRequest(BaseModel):
    question: str

    @field_validator("question")
    @classmethod
    def question_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("La question ne peut pas être vide")
        return v


class ChartData(BaseModel):
    type: str
    labels: List[str]
    values: List[float]


class AskResponse(BaseModel):
    mode: str
    answer: str
    sql: Optional[str] = None
    sql_explanation: Optional[str] = None
    columns: Optional[List[str]] = None
    rows: Optional[List[List[Any]]] = None
    row_count: Optional[int] = None
    chart: Optional[ChartData] = None
    tables: Optional[List[str]] = None
    duration_ms: Optional[int] = None


@router.post("/ask", response_model=AskResponse)
async def ask(
    body: AskRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return answer_question(db, user, body.question)


@router.get("/logs")
async def logs(
    limit: int = 50,
    user: User = Depends(get_current_user),
):
    limit = max(1, min(limit, 200))
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                """
                SELECT id, user_nom, user_id, question, mode, sql_generated,
                       row_count, duration_ms, status, error, answer, tables,
                       created_at
                FROM ai_query_log
                ORDER BY created_at DESC, id DESC
                LIMIT :limit
                """
            ),
            {"limit": limit},
        ).fetchall()
    return [
        {
            "id": r[0], "user_nom": r[1], "user_id": r[2], "question": r[3],
            "mode": r[4], "sql": r[5], "row_count": r[6], "duration_ms": r[7],
            "status": r[8], "error": r[9], "answer": r[10], "tables": r[11],
            "created_at": r[12].isoformat() if r[12] else None,
        }
        for r in rows
    ]
