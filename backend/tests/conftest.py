"""Fixtures communes aux tests (pytest).

Le TestClient charge l'app FastAPI réelle. Les routes gold et le login
dépendent de la vraie base PostgreSQL -> les tests d'intégration sont
sautés (skip) proprement si la base n'est pas joignable, pour ne pas
faire échouer la CI sur une machine sans Postgres.
"""
import os
import sys
from pathlib import Path

import pytest

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

# 1. Charger les variables du .env backend avant tout import d'app.config
ENV_FILE = BACKEND / ".env"
if ENV_FILE.exists():
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip())

from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from app.config import settings
from app.main import app


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def db_engine():
    return create_engine(settings.DATABASE_URL)


@pytest.fixture(scope="session")
def db_available(db_engine):
    try:
        with db_engine.connect():
            return True
    except Exception:
        return False


@pytest.fixture(scope="session")
def auth_header(client, db_available):
    if not db_available:
        pytest.skip("Base PostgreSQL non joignable")
    login = client.post(
        "/auth/login",
        json={"email": "dg@sahambank.ma", "password": "Demo2026!"},
    )
    assert login.status_code == 200, "Login démo échoué, seed non appliqué"
    return {"Authorization": f"Bearer {login.json()['access_token']}"}
