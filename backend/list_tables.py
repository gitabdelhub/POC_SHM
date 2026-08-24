import psycopg2
conn = psycopg2.connect('postgresql://postgres:postgre_abdel@localhost:5432/saham_bank')
cur = conn.cursor()
cur.execute("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
tables = [r[0] for r in cur.fetchall()]
print("Tables:", tables)

# Find the AI log table
for t in tables:
    if 'log' in t or 'query' in t or 'ask' in t or 'ai' in t or 'chat' in t:
        print(f"\n=== {t} columns ===")
        cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='{t}' ORDER BY ordinal_position")
        for col, dtype in cur.fetchall():
            print(f"  {col}: {dtype}")
        print(f"\n=== {t} last 2 rows ===")
        cur.execute(f"SELECT * FROM {t} ORDER BY id DESC LIMIT 2")
        rows = cur.fetchall()
        if rows:
            cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name='{t}' ORDER BY ordinal_position")
            cols = [r[0] for r in cur.fetchall()]
            for row in rows:
                for c, v in zip(cols, row):
                    print(f"  {c}: {str(v)[:200]}")
                print("---")
conn.close()
