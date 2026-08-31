"""Planification légère du pipeline ETL (pas d'Airflow).

Utilise APScheduler en arrière-plan : un job quotidien à ETL_SCHEDULE_HOUR
relance le pipeline complet (bronze → silver → gold) à partir des CSV.

Utile en pair avec un cron Render (voir cron.yaml) pour le cloud ; ici le
scheduler in-process couvre le cas local / container sans dépendre d'un
scheduler externe.

Usage (déclencher manuellement depuis le code) :
    from app.scheduler import run_etl
    run_etl()
"""

import logging

try:
    from apscheduler.schedulers.background import BackgroundScheduler
except ImportError:
    BackgroundScheduler = None

from app.config import settings
from etl.run_pipeline import run_all

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


def run_etl_job() -> None:
    """Relance le pipeline ETL. Appelée par la planification ou manuellement."""
    logger.info("Démarrage du batch ETL planifié...")
    try:
        run_all()
        logger.info("Batch ETL terminé avec succès.")
    except Exception as exc:  # ne pas faire tomber le scheduler
        logger.exception("Batch ETL échoué : %s", exc)


def start_scheduler() -> None:
    """Démarre le scheduler si activé et pas déjà lancé."""
    _start_scheduler(settings.ETL_SCHEDULER_ENABLED, settings.ETL_SCHEDULE_HOUR)


def _start_scheduler(enabled: bool, hour: int) -> None:
    global _scheduler
    if not enabled:
        logger.info("Planification ETL désactivée (ETL_SCHEDULER_ENABLED=false).")
        return
    if _scheduler and _scheduler.running:
        return

    _scheduler = BackgroundScheduler()
    # Cronexpr simple : min heure * * *  (ex. 2h → 0 2 * * *)
    _scheduler.add_job(
        run_etl_job,
        trigger="cron",
        hour=hour,
        minute=0,
        id="etl_daily",
        replace_existing=True,
        misfire_grace_time=3600,
    )
    _scheduler.start()
    logger.info("Planification ETL active : daily à %02d:00.", hour)


def stop_scheduler() -> None:
    """Arrête proprement le scheduler (appelé au shutdown)."""
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None
