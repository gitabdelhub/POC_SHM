"""Tests du routeur SahamAI (chatbot analytique).

Le provider LLM est forcé en "mock" (réponses codées en dur) pour que la CI
tourne sans clé Groq. On vérifie le pipeline complet : question -> SQL
généré -> exécution réelle en lecture seule -> réponse + graphe + journal.

Les tests qui dépendent de la base sont skippés proprement si Postgres
n'est pas joignable (voir conftest.py).
"""

import pytest
from fastapi.testclient import TestClient

from app.config import settings


@pytest.fixture(autouse=True)
def mock_llm(monkeypatch):
    """Force le LLM en mode mock + réinitialise le singleton entre les tests."""
    import app.services.rag.llm as llm_mod

    monkeypatch.setattr(settings, "LLM_PROVIDER", "mock")
    llm_mod._llm_singleton = None
    yield
    llm_mod._llm_singleton = None


def test_ask_requires_auth(client: TestClient):
    resp = client.post("/ai/ask", json={"question": "Combien de clients ?"})
    assert resp.status_code == 401


def test_ask_sql_flow(client: TestClient, auth_header, db_available):
    if not db_available:
        pytest.skip("Base PostgreSQL non joignable")
    resp = client.post(
        "/ai/ask",
        json={"question": "Combien d'engagements en base ?"},
        headers=auth_header,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "sql"
    assert data["answer"]
    assert data["sql"]
    assert "SELECT" in data["sql"].upper()
    assert "columns" in data and isinstance(data["columns"], list)
    assert isinstance(data["row_count"], int)
    assert "duration_ms" in data


def test_ask_oob_question(client: TestClient, auth_header, db_available):
    if not db_available:
        pytest.skip("Base PostgreSQL non joignable")
    resp = client.post(
        "/ai/ask",
        json={"question": "Quel temps fait-il a Casablanca ?"},
        headers=auth_header,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "oob"
    assert data["answer"]


def test_ask_logs_written(client: TestClient, auth_header, db_available):
    if not db_available:
        pytest.skip("Base PostgreSQL non joignable")
    before = len(client.get("/ai/logs?limit=1000", headers=auth_header).json())
    client.post(
        "/ai/ask",
        json={"question": "Combien d'engagements en base ?"},
        headers=auth_header,
    )
    after = len(client.get("/ai/logs?limit=1000", headers=auth_header).json())
    assert after >= before + 1


def test_logs_requires_auth(client: TestClient):
    resp = client.get("/ai/logs")
    assert resp.status_code == 401


def test_ask_rejects_empty_question(client: TestClient, auth_header, db_available):
    if not db_available:
        pytest.skip("Base PostgreSQL non joignable")
    resp = client.post("/ai/ask", json={"question": "   "}, headers=auth_header)
    # Le champ est vide -> FastAPI/Pydantic accepte, mais on doit renvoyer
    # une réponse exploitable (mock) ou une erreur propre, jamais un 500.
    assert resp.status_code in (200, 422)
