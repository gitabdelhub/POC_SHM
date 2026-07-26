"""Setup database and run ETL"""
from sqlalchemy import create_engine, text
import os, sys

# Create DB if not exists
default_url = 'postgresql://postgres:postgre_abdel@localhost:5432/postgres'
engine = create_engine(default_url)
with engine.connect() as conn:
    conn.execute(text("COMMIT"))
    result = conn.execute(text("SELECT 1 FROM pg_database WHERE datname='saham_bank'")).fetchone()
    if not result:
        conn.execute(text("CREATE DATABASE saham_bank"))
        print("Created database saham_bank")
    else:
        print("Database saham_bank already exists")
engine.dispose()

# Now run Bronze ETL
sys.path.insert(0, os.path.dirname(__file__))
from etl.bronze.extract_bronze import BronzeExtractor
from etl.bronze.load_bronze import BronzeLoader

print("\n=== BRONZE ETL ===")
extractor = BronzeExtractor()
data = extractor.extract_all()
for k, v in data.items():
    print(f"  {k}: {len(v)} rows")

loader = BronzeLoader()
loader.create_tables()
loader.truncate_all()
counts = loader.load_all(data)
for t, c in counts.items():
    print(f"  bronze_{t}: {c} rows")

# Run Silver ETL
print("\n=== SILVER ETL ===")
from etl.silver.transform_silver import SilverTransformer
from etl.silver.load_silver import SilverLoader

transformer = SilverTransformer()
silver_data = transformer.transform_all(data)

loader2 = SilverLoader()
loader2.create_tables()
loader2.truncate_all()
counts2 = loader2.load_all(silver_data)
for t, c in counts2.items():
    print(f"  silver_{t}: {c} rows")

print("\nETL Complete!")
