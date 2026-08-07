"""Tests de base : santé de l'API."""


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "healthy"}


def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    body = r.json()
    assert "Saham Bank" in body["message"]


def test_docs(client):
    r = client.get("/docs")
    assert r.status_code == 200
