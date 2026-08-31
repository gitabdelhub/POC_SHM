"""Tests de la planification ETL légère (scheduler + endpoint /etl/run)."""

from app.scheduler import _start_scheduler, stop_scheduler


def test_scheduler_desactive_par_defaut():
    """En dev le scheduler ne doit pas tourner (cookie/table non impactée)."""
    import app.scheduler as sched

    # En appelant _start_scheduler(False, ...) aucun job n'est créé.
    _start_scheduler(False, 2)
    assert sched._scheduler is None or not sched._scheduler.running
    stop_scheduler()


def test_scheduler_cree_job_quotidien():
    import app.scheduler as sched

    _start_scheduler(True, 5)
    jobs = sched._scheduler.get_jobs()
    assert any(j.id == "etl_daily" for j in jobs)
    stop_scheduler()


def test_etl_run_necessite_auth(client):
    r = client.post("/etl/run")
    assert r.status_code == 401


def test_etl_run_avec_token_renvoie_ok(client, auth_header):
    r = client.post("/etl/run", headers=auth_header)
    assert r.status_code == 200
    body = r.json()
    # Soit lancé, soit déjà en cours ; jamais d'erreur 500.
    assert "started" in body
