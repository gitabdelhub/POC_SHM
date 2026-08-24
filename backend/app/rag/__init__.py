"""
Module RAG (Retrieval-Augmented Generation) & Text-to-SQL de Saham Bank.

Composants isolés :
  - text2sql: Moteur Text-to-SQL et prompts
  - llm: Client multi-provider LLM (Groq, Ollama, Mock)
  - vector_store: Stockage vectoriel (pgvector) & exécution SQL sécurisée
  - embeddings: Service de vectorisation FastEmbed
  - ingestor: Ingestion et chunking de documents
"""

from app.rag.llm import LLMClient, get_llm
from app.rag.text2sql import answer_question
from app.rag.vector_store import execute_read_only_sql

__all__ = [
    "LLMClient",
    "get_llm",
    "answer_question",
    "execute_read_only_sql",
]
