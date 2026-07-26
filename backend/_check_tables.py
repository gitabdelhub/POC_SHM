from sqlalchemy import create_engine, text
e = create_engine('postgresql://postgres:postgre_abdel@localhost:5432/saham_bank')
with e.connect() as c:
    tables = c.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")).fetchall()
    for t in tables:
        print(t[0])
