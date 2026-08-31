"""Routeur ETL : déclenchement manuel du pipeline (utile pour les tests).

POST /etl/run  → relance bronze → silver → gold immédiatement.
Protégé par JWT, réservé aux rôles DG et ADMIN.
"""

import threading

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.deps import require_roles
from app.scheduler import run_etl_job

router = APIRouter(prefix="/etl", tags=["ETL"])

# Verrou pour éviter deux ETL simultanés (la base n'apprécie pas les écritures
# concurrentes sur les mêmes tables).
_etl_lock = threading.Lock()


class EtlStatus(BaseModel):
    started: bool
    message: str


@router.post("/run", response_model=EtlStatus, dependencies=[Depends(require_roles("DG", "ADMIN"))])
async def run_etl_manual():
    """Relance le pipeline ETL complet en arrière-plan.

    Renvoie immédiatement : le vrai travail se fait en tâche de fond.
    La progression est visible dans les logs de l'application.
    """
    if _etl_lock.locked():
        return EtlStatus(started=False, message="Un ETL est déjà en cours")

    def worker():
        with _etl_lock:
            run_etl_job()

    threading.Thread(target=worker, daemon=True).start()
    return EtlStatus(started=True, message="ETL lancé en arrière-plan (logs de l'app)")
