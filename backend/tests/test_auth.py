"""Tests de l'authentification : login, token, /me."""

import pytest


@pytest.mark.parametrize(
    "email",
    [
        "dg@sahambank.ma",
        "dr@sahambank.ma",
        "ca@sahambank.ma",
        "ar@sahambank.ma",
        "admin@sahambank.ma",
    ],
)
def test_login_ok(client, email):
    r = client.post("/auth/login", json={"email": email, "password": "Demo2026!"})
    assert r.status_code == 200
    d = r.json()
    assert d["access_token"]
    assert d["token_type"] == "bearer"
    assert d["expires_in"] == 900


def test_login_wrong_password(client):
    r = client.post("/auth/login", json={"email": "dg@sahambank.ma", "password": "mauvais"})
    assert r.status_code in (401, 403)


def test_login_unknown_user(client):
    r = client.post("/auth/login", json={"email": "nobody@sahambank.ma", "password": "Demo2026!"})
    assert r.status_code == 401


def test_me_with_valid_token(client):
    login = client.post("/auth/login", json={"email": "dg@sahambank.ma", "password": "Demo2026!"})
    token = login.json()["access_token"]
    r = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "dg@sahambank.ma"


def test_me_without_token(client):
    r = client.get("/auth/me")
    assert r.status_code == 401
