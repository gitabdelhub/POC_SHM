"""
Test du chargement Bronze : CSV → PostgreSQL
"""
from etl.bronze.extract_bronze import BronzeExtractor
from etl.bronze.load_bronze import BronzeLoader


def main():
    print("=" * 50)
    print("ETAPE 1 : Extraction depuis les CSV")
    print("=" * 50)
    extractor = BronzeExtractor()
    data = extractor.extract_all()
    for key, rows in data.items():
        print(f"  {key}: {len(rows)} lignes")

    print("\n" + "=" * 50)
    print("ETAPE 2 : Chargement dans PostgreSQL (Bronze)")
    print("=" * 50)
    loader = BronzeLoader()
    loader.create_tables()
    counts = loader.load_all(data)

    print("\n  Chargement termine !")
    for table, count in counts.items():
        print(f"  bronze_{table}: {count} lignes inserees / upsertées")


if __name__ == "__main__":
    main()
