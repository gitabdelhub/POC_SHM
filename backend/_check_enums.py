from sqlalchemy import create_engine, text
e = create_engine('postgresql://postgres:postgre_abdel@localhost:5432/saham_bank')
with e.connect() as c:
    enums = c.execute(text("""
        SELECT t.typname, e.enumlabel
        FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
        ORDER BY t.typname, e.enumsortorder
    """)).fetchall()
    for r in enums:
        print(f"{r.typname}: {r.enumlabel}")
