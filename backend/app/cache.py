"""
Petit cache en mémoire pour les indicateurs du tableau de bord (routes /gold).

Les données Gold ne changent que lorsque le pipeline ETL est relancé : inutile de
refaire la même requête à chaque affichage. Chaque résultat est gardé 5 minutes,
et tout le cache est vidé à la fin d'un ETL (voir scheduler.run_etl_job).
"""

import threading
import time
from typing import Any, Callable, Dict, Hashable, Tuple

TTL_SECONDS = 300

_store: Dict[Hashable, Tuple[float, Any]] = {}
_lock = threading.Lock()


def get_or_compute(key: Hashable, compute: Callable[[], Any]) -> Any:
    """Renvoie le résultat en cache s'il a moins de 5 minutes, sinon le calcule."""
    now = time.monotonic()
    with _lock:
        hit = _store.get(key)
        if hit and now - hit[0] < TTL_SECONDS:
            return hit[1]
    value = compute()  # calcul hors du verrou : les autres requêtes ne sont pas bloquées
    with _lock:
        _store[key] = (now, value)
    return value


def clear() -> None:
    """Vide tout le cache (appelé après chaque exécution du pipeline)."""
    with _lock:
        _store.clear()
