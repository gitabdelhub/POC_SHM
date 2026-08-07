"""Tests de cohérence ETL (intégration base PostgreSQL).

Vérifie que les comptages du warehouse correspondent aux valeurs
attendues après les chantiers T1 (seed fixé), T2 (fact_risque complet)
et T3 (vraie ville). Saute si la base n'est pas joignable.
"""

import pytest
from sqlalchemy import text


@pytest.fixture
def require_db(db_available):
    if not db_available:
        pytest.skip("Base PostgreSQL non joignable")


def test_dim_client_villes_reelles(db_engine, require_db):
    with db_engine.connect() as conn:
        fake = conn.execute(
            text("SELECT COUNT(*) FROM dim_client WHERE ville LIKE 'Ville-%'")
        ).scalar()
        assert fake == 0, "Il reste des villes fabriquées 'Ville-X' (T3 non appliqué)"


def test_dim_client_total(db_engine, require_db):
    with db_engine.connect() as conn:
        total = conn.execute(text("SELECT COUNT(*) FROM dim_client")).scalar()
        assert total > 0


def test_fact_risque_couvre_48_mois(db_engine, require_db):
    with db_engine.connect() as conn:
        mois = conn.execute(text(
            "SELECT COUNT(DISTINCT ds.annee_mois) "
            "FROM fact_risque fr JOIN dim_date ds ON fr.date_id = ds.date_id"
        )).scalar()
        assert mois == 48, f"fact_risque ne couvre que {mois} mois (T2 non appliqué)"


def test_fact_risque_nb_lignes(db_engine, require_db):
    with db_engine.connect() as conn:
        n = conn.execute(text("SELECT COUNT(*) FROM fact_risque")).scalar()
        assert n == 476 * 48, f"fact_risque = {n} lignes, attendu {476 * 48}"


def test_bronze_vs_silver_clients(db_engine, require_db):
    with db_engine.connect() as conn:
        bronze = conn.execute(text("SELECT COUNT(*) FROM bronze_clients")).scalar()
        silver = conn.execute(text("SELECT COUNT(*) FROM silver_clients")).scalar()
        assert silver >= bronze, "silver doit stocker >= bronze (stocke les invalides)"


def test_engagements_or_pas_vide(db_engine, require_db):
    with db_engine.connect() as conn:
        n = conn.execute(text("SELECT COUNT(*) FROM fact_engagement")).scalar()
        assert n > 0
