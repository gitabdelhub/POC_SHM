from sqlalchemy import create_engine, text
e = create_engine('postgresql://postgres:postgre_abdel@localhost:5432/saham_bank')
with e.connect() as c:
    valid = c.execute(text("SELECT COUNT(*) FROM silver_clients WHERE is_valid = true")).scalar()
    invalid = c.execute(text("SELECT COUNT(*) FROM silver_clients WHERE is_valid = false")).scalar()
    total = c.execute(text("SELECT COUNT(*) FROM silver_clients")).scalar()
    print(f"Clients: {total} total, {valid} valid, {invalid} invalid")
    
    eng_valid = c.execute(text("SELECT COUNT(*) FROM silver_engagements WHERE is_valid = true")).scalar()
    eng_total = c.execute(text("SELECT COUNT(*) FROM silver_engagements")).scalar()
    print(f"Engagements: {eng_total} total, {eng_valid} valid")
    
    # Check how many engagements reference valid clients
    eng_refs = c.execute(text("""
        SELECT COUNT(*) FROM silver_engagements e
        JOIN silver_clients c ON e.client_id = c.id
        WHERE e.is_valid = true AND c.is_valid = true
    """)).scalar()
    print(f"Engagements referencing valid clients: {eng_refs}")
