"""
Modèles SQLAlchemy pour le chatbot RAG

ai_documents : fichiers ingérés (PDF, Word, Excel, CSV, TXT) et découpés en chunks.
ai_chunks    : morceaux de texte + embedding vectoriel (pgvector) - table gérée en SQL brut.
ai_query_log : journal de toutes les questions posées au chatbot (traçabilité admin).
"""

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class AIDocument(Base):
    __tablename__ = "ai_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    source = Column(String(50), default="upload")          # upload | folder | seed
    doc_type = Column(String(20), nullable=True)
    chunks_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    ingested_at = Column(DateTime(timezone=True), server_default=func.now())


class AIQueryLog(Base):
    __tablename__ = "ai_query_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=True)
    user_nom = Column(String(100), nullable=True)
    question = Column(Text, nullable=False)
    mode = Column(String(20), default="sql")               # sql | rag | hybride
    sql_generated = Column(Text, nullable=True)
    row_count = Column(Integer, default=0)
    duration_ms = Column(Integer, default=0)
    status = Column(String(20), default="success")          # success | error | no_sql
    error = Column(Text, nullable=True)
    tables = Column(Text, nullable=True)                   # liste de tables, séparées par ","
    answer = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
