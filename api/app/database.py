"""
Connexion unique à PostgreSQL, partagée par toute l'application (API, chatbot, ETL).

Pourquoi pg8000 ? C'est un pilote écrit en pur Python : il fonctionne partout,
y compris dans les fonctions serveur de Vercel où les pilotes compilés
(psycopg2) ne sont pas toujours disponibles.

normalize_database_url() accepte l'adresse telle que Neon la fournit
(postgresql://...?sslmode=require) et la convertit pour pg8000.
"""

import ssl
from typing import Any, Dict, Tuple
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

# Paramètres propres à libpq (psql, psycopg2) que pg8000 ne comprend pas
_LIBPQ_ONLY_PARAMS = {"sslmode", "channel_binding", "sslrootcert", "sslcert", "sslkey"}


def normalize_database_url(url: str) -> Tuple[str, Dict[str, Any]]:
    """Retourne (url pour SQLAlchemy + pg8000, connect_args)."""
    url = url.strip()
    for prefix in ("postgres://", "postgresql://", "postgresql+psycopg2://", "postgresql+psycopg://"):
        if url.startswith(prefix):
            url = "postgresql+pg8000://" + url[len(prefix):]
            break

    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query))
    sslmode = query.get("sslmode", "")
    kept = {k: v for k, v in query.items() if k not in _LIBPQ_ONLY_PARAMS}
    url = urlunsplit(parts._replace(query=urlencode(kept)))

    connect_args: Dict[str, Any] = {}
    host = parts.hostname or ""
    if sslmode in ("require", "verify-ca", "verify-full") or host.endswith("neon.tech"):
        # Contexte SSL standard : chiffrement ET vérification du certificat du serveur
        connect_args["ssl_context"] = ssl.create_default_context()
    return url, connect_args


db_url, connect_args = normalize_database_url(settings.DATABASE_URL)

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,   # vérifie la connexion avant usage (Neon coupe les connexions inactives)
    pool_size=3,
    max_overflow=2,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
