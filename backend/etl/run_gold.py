"""
ETL Gold - Silver → Star Schema (Dimensions + Facts)
"""
from etl.gold.load_gold import GoldLoader
from etl.gold.transform_gold import GoldTransformer


def main():
    print("=" * 60)
    print("ETL SAHAM BANK - COUCHE GOLD (STAR SCHEMA)")
    print("=" * 60)

    print("\n[1] Transformation...")
    t = GoldTransformer()

    print("  dim_date...")
    dim_date = t.build_dim_date()
    print(f"    {len(dim_date)} rows")

    print("  dim_client...")
    dim_client = t.build_dim_client()
    print(f"    {len(dim_client)} rows")

    print("  dim_agence...")
    dim_agence = t.build_dim_agence()
    print(f"    {len(dim_agence)} rows")

    print("  dim_type_credit...")
    dim_tc = t.build_dim_type_credit()
    print(f"    {len(dim_tc)} rows")

    print("  dim_utilisateur...")
    dim_user = t.build_dim_utilisateur()
    print(f"    {len(dim_user)} rows")

    print("  fact_engagement...")
    fact_eng = t.build_fact_engagement(dim_client, dim_tc)
    print(f"    {len(fact_eng)} rows")

    print("  fact_performance...")
    fact_perf = t.build_fact_performance(dim_agence, dim_date)
    print(f"    {len(fact_perf)} rows")

    print("  fact_risque...")
    fact_risk = t.build_fact_risque(dim_client, dim_date)
    print(f"    {len(fact_risk)} rows")

    print("  fact_qualite...")
    fact_qual = t.build_fact_qualite(dim_agence, dim_date)
    print(f"    {len(fact_qual)} rows")

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

    print("\n[2] Chargement Gold...")
    loader = GoldLoader()
    loader.create_tables()
    loader.truncate_all()
    counts = loader.load_all(gold_data)

    print()
    for table, count in counts.items():
        print(f"  {table}: {count} lignes upsertées")

    print("\n" + "=" * 60)
    print("GOLD TERMINE")
    print("=" * 60)


if __name__ == "__main__":
    main()
