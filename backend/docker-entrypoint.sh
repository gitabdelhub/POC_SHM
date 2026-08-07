#!/bin/sh
set -e

echo "==> Attente de PostgreSQL (${DB_HOST:-db}:${DB_PORT:-5432})..."
until python -c "
import os, socket, sys
host = os.environ.get('DB_HOST', 'db')
port = int(os.environ.get('DB_PORT', '5432'))
s = socket.socket()
try:
    s.connect((host, port))
    sys.exit(0)
except Exception:
    sys.exit(1)
"; do
  echo "==> PostgreSQL pas encore prêt, nouvelle tentative dans 2s..."
  sleep 2
done
echo "==> PostgreSQL prêt."

echo "==> Création des tables applicatives (init_db)..." ; python -c "from app.database import init_db; init_db()"

# Les tables GOLD sont créées par le pipeline ETL. On les charge si absentes ou vides.
echo "==> Vérification de la présence des données GOLD..."
NEED_ETL=$(python -c "
from sqlalchemy import text
from app.database import engine
with engine.connect() as conn:
    exists = conn.execute(text(\"SELECT to_regclass('public.fact_engagement') IS NOT NULL\")).scalar()
    rows = 0
    if exists:
        rows = conn.execute(text('SELECT COUNT(*) FROM fact_engagement')).scalar() or 0
    print('1' if rows == 0 else '0')
")

if [ "$NEED_ETL" = "1" ]; then
  echo "==> Données gold absentes/vides : lancement du pipeline ETL complet..."
  python -m etl.run_pipeline
fi

echo "==> Seed des comptes de démo (idempotent)..."
python -m app.seed_demo

echo "==> Démarrage de l'API (uvicorn) sur :8000"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000