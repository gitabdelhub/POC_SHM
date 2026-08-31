"""Tests des endpoints gold (protégés par JWT depuis la Sécurité API).

Vérifie que sans token on obtient 401, et qu'avec un token démo valide
les endpoints répondent. Si la base n'est pas joignable, skip proprement.
"""

import pytest


@pytest.fixture
def require_db(db_available, auth_header):
    # auth_header skippe déjà si la base n'est pas joignable
    pass


def test_gold_requires_token(client, db_available):
    if not db_available:
        pytest.skip("Base PostgreSQL non joignable")
    r = client.get("/gold/kpis")
    assert r.status_code == 401


def test_kpis(client, require_db, auth_header):
    r = client.get("/gold/kpis", headers=auth_header)
    assert r.status_code == 200
    d = r.json()
    assert d["total_clients"] > 0
    assert d["total_encours"] >= 0
    assert d["total_agences"] > 0


def test_pnb_mensuel_sans_annee(client, require_db, auth_header):
    r = client.get("/gold/pnb-mensuel", headers=auth_header)
    assert r.status_code == 200
    rows = r.json()
    assert isinstance(rows, list)
    assert len(rows) > 0
    assert "annee_mois" in rows[0]


def test_pnb_mensuel_avec_annee(client, require_db, auth_header):
    r = client.get("/gold/pnb-mensuel", params={"annee": 2026}, headers=auth_header)
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) > 0
    for row in rows:
        assert row["annee_mois"].startswith("2026")


def test_credits_par_type(client, require_db, auth_header):
    r = client.get("/gold/credits-par-type", headers=auth_header)
    assert r.status_code == 200
    assert len(r.json()) > 0


def test_clients_par_statut(client, require_db, auth_header):
    r = client.get("/gold/clients-par-statut", headers=auth_header)
    assert r.status_code == 200
    assert len(r.json()) > 0


def test_risque_par_classe(client, require_db, auth_header):
    r = client.get("/gold/risque-par-classe", headers=auth_header)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_encours_par_region(client, require_db, auth_header):
    r = client.get("/gold/encours-par-region", headers=auth_header)
    assert r.status_code == 200
    rows = r.json()
    assert isinstance(rows, list)
    assert len(rows) > 0
    assert "total_volume" in rows[0]
    assert "ville" in rows[0]

