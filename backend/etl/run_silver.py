"""
Test complet de la couche Silver : extraire Bronze -> transformer Silver -> charger Silver
"""
from etl.bronze.extract_bronze import BronzeExtractor
from etl.silver.transform_silver import SilverTransformer
from etl.silver.load_silver import SilverLoader


def main():
    print("=" * 60)
    print("ETL SAHAM BANK - COUCHE SILVER")
    print("=" * 60)

    print("\n[1] Extraction Bronze...")
    extractor = BronzeExtractor()
    bronze_data = extractor.extract_all()
    for table, rows in bronze_data.items():
        print(f"  bronze_{table}: {len(rows)} lignes lues")

    print("\n[2] Transformation Silver...")
    transformer = SilverTransformer()
    silver_data = transformer.transform_all(bronze_data)

    for table, rows in silver_data.items():
        total = len(rows)
        valides = sum(1 for r in rows if r["is_valid"])
        print(f"  silver_{table}: {valides}/{total} valides")
        if total - valides > 0:
            print(f"    Lignes invalides:")
            for r in rows:
                if not r["is_valid"]:
                    id_key = r.get("id") or r.get("ref", "?")
                    print(f"      {id_key}: {r['error_message']}")

    print("\n[3] Chargement Silver...")
    loader = SilverLoader()
    loader.create_tables()
    counts = loader.load_all(silver_data)

    print()
    for table, count in counts.items():
        print(f"  silver_{table}: {count} lignes upsertées")

    print("\n" + "=" * 60)
    print("SILVER TERMINE")
    print("=" * 60)


if __name__ == "__main__":
    main()
