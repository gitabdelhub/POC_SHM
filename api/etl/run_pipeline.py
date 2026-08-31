"""
Orchestrateur ETL Saham Bank : bronze → silver → gold (pipeline complet).

Différence avec run_bronze.py / run_silver.py / run_gold.py :
  - une seule source CSV est lue, une seule fois ;
  - la couche silver est transformée depuis les DONNÉES bronze en mémoire
    (et non en relisant le CSV), ce qui garantit bronze == silver ;
  - la couche gold est reconstruite depuis les tables silver fraîchement
    chargées ;
  - en cas d'erreur, l'étape fautive est signalée et le processus s'arrête
    (code de sortie != 0) : on peut relancer l'étape seule avec --step.

Usage :
  python -m etl.run_pipeline                 # bronze + silver + gold
  python -m etl.run_pipeline --step bronze   # une seule étape
"""

import sys
from typing import Any, Dict, List

from sqlalchemy import text

from app.database import engine
from etl.bronze.extract_bronze import BronzeExtractor
from etl.bronze.load_bronze import BronzeLoader
from etl.gold.load_gold import GoldLoader
from etl.gold.transform_gold import GoldTransformer
from etl.silver.load_silver import SilverLoader
from etl.silver.transform_silver import SilverTransformer

SEP = "=" * 64


def step_bronze(bronze_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, int]:
    print(f"\n{SEP}\nETAPE 1 - BRONZE (CSV -> PostgreSQL)\n{SEP}")
    loader = BronzeLoader()
    loader.create_tables()
    loader.truncate_all()
    counts = loader.load_all(bronze_data)
    for table, count in counts.items():
        print(f"  bronze_{table}: {count} lignes")
    return counts


def step_silver(bronze_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, int]:
    print(f"\n{SEP}\nETAPE 2 - SILVER (validation + dédup depuis le bronze)\n{SEP}")
    transformer = SilverTransformer()
    silver_data = transformer.transform_all(bronze_data)
    for table, rows in silver_data.items():
        valides = sum(1 for r in rows if r["is_valid"])
        print(f"  silver_{table}: {valides}/{len(rows)} valides")
        invalides = [r for r in rows if not r["is_valid"]]
        for r in invalides[:3]:
            id_key = r.get("id") or r.get("ref") or r.get("qualite_id") or "?"
            print(f"    [rejeté] {id_key}: {r['error_message']}")
        if len(invalides) > 3:
            print(f"    ... et {len(invalides) - 3} autres rejets")
    loader = SilverLoader()
    loader.create_tables()
    loader.truncate_all()
    counts = loader.load_all(silver_data)
    for table, count in counts.items():
        print(f"  silver_{table}: {count} lignes chargées")
    return counts


def step_gold() -> Dict[str, int]:
    print(f"\n{SEP}\nETAPE 3 - GOLD (star schema depuis les tables silver)\n{SEP}")
    t = GoldTransformer()
    dim_date = t.build_dim_date()
    dim_client = t.build_dim_client()
    dim_agence = t.build_dim_agence()
    dim_tc = t.build_dim_type_credit()
    dim_user = t.build_dim_utilisateur()
    fact_eng = t.build_fact_engagement(dim_client, dim_tc)
    fact_perf = t.build_fact_performance(dim_agence, dim_date)
    fact_risk = t.build_fact_risque(dim_client, dim_date)
    fact_qual = t.build_fact_qualite(dim_agence, dim_date)

    gold_data = {
        "dim_date": dim_date,
        "dim_client": dim_client,
        "dim_agence": dim_agence,
        "dim_type_credit": dim_tc,
        "dim_utilisateur": dim_user,
        "fact_engagement": fact_eng,
        "fact_performance": fact_perf,
        "fact_risque": fact_risk,
        "fact_qualite": fact_qual,
    }

    loader = GoldLoader()
    loader.create_tables()      # recrée les tables gold
    loader.load_all(gold_data)  # upsert (pas de truncate nécessaire)
    for table, count in gold_data.items():
        print(f"  {table}: {count} lignes")
    return {k: len(v) for k, v in gold_data.items()}


def verify() -> None:
    print(f"\n{SEP}\nVÉRIFICATION DE COHÉRENCE\n{SEP}")
    with engine.connect() as conn:
        tables = ["bronze_qualite", "silver_qualite", "fact_qualite", "bronze_clients",
                  "silver_clients", "dim_client", "bronze_engagements",
                  "silver_engagements", "fact_engagement"]
        for table in tables:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar() or 0
            print(f"  {table}: {count}")
        bronze_valid = conn.execute(text(
            "SELECT COUNT(*) FROM silver_qualite WHERE is_valid = TRUE"
        )).scalar() or 0
        print(f"  -> silver_qualite is_valid: {bronze_valid}")
    print("\n  Cohérence : bronze et silver sont issus du même CSV ;")
    print("  gold ne garde que les lignes valides avec une agence connue.")


def main() -> None:
    args = sys.argv[1:]
    only = None
    if "--step" in args:
        only = args[args.index("--step") + 1]
    if only and only not in ("bronze", "silver", "gold"):
        print(f"Étape inconnue : {only} (bronze | silver | gold)")
        sys.exit(2)
    run_all(only)


def run_all(only: str | None = None) -> None:
    """Exécute le pipeline complet (bronze → silver → gold).

    Récupère du main() pour pouvoir être appelée par le planificateur
    (APScheduler) ou l'endpoint /etl/run sans passer par sys.argv.
    """
    print(SEP)
    print("PIPELINE ETL SAHAM BANK")
    print(SEP)

    bronze_data = BronzeExtractor().extract_all()
    for key, rows in bronze_data.items():
        print(f"  CSV {key}: {len(rows)} lignes lues")

    try:
        if only in (None, "bronze"):
            step_bronze(bronze_data)
        if only in (None, "silver"):
            step_silver(bronze_data)
        if only in (None, "gold"):
            step_gold()
    except Exception as exc:
        print(f"\n[ERREUR] Pipeline interrompu : {exc}")
        raise RuntimeError(f"ETL interrompu : {exc}") from exc

    verify()
    print(f"\n{SEP}\nPIPELINE TERMINÉ AVEC SUCCÈS\n{SEP}")


if __name__ == "__main__":
    main()
