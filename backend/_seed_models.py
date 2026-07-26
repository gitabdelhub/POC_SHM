"""Copy Silver data to SQLAlchemy model tables"""
from sqlalchemy import create_engine, text

DB = 'postgresql://postgres:postgre_abdel@localhost:5432/saham_bank'
e = create_engine(DB)

with e.connect() as conn:
    # Truncate existing data
    for t in ["engagements", "clients", "agences", "users"]:
        conn.execute(text(f"DELETE FROM {t}"))
    conn.commit()

    # Users
    conn.execute(text("""
        INSERT INTO users (id, email, nom, role, is_active, hashed_password)
        SELECT id, email, nom, role::text::public."userrole", is_active, hashed_password
        FROM silver_users
        ON CONFLICT (id) DO NOTHING
    """))
    print("users done")

    # Agences
    conn.execute(text("""
        INSERT INTO agences (id, nom, ville, region, directeur, telephone, email)
        SELECT id, nom, ville, region, directeur, telephone, email
        FROM silver_agences
        ON CONFLICT (id) DO NOTHING
    """))
    print("agences done")

    # Clients (all valid + invalid to satisfy FK)
    conn.execute(text("""
        INSERT INTO clients (id, nom, segment, agence_id, encours, score, statut, email, telephone)
        SELECT c.id, c.nom,
            CASE c.segment
                WHEN 'Particuliers' THEN 'PARTICULIERS'::public."clientsegment"
                WHEN 'Professionnels' THEN 'PROFESSIONNELS'::public."clientsegment"
                WHEN 'PME' THEN 'PME'::public."clientsegment"
                WHEN 'Grandes Entreprises' THEN 'GRANDES_ENTREPRISES'::public."clientsegment"
                WHEN 'Bancassurance' THEN 'BANCASSURANCE'::public."clientsegment"
                ELSE 'PARTICULIERS'::public."clientsegment"
            END,
            c.agence_id,
            COALESCE(c.encours, 0),
            COALESCE(c.score, 50),
            CASE COALESCE(c.statut, 'Actif')
                WHEN 'Actif' THEN 'ACTIF'::public."clientstatus"
                WHEN 'A risque' THEN 'A_RISQUE'::public."clientstatus"
                WHEN 'Defaut' THEN 'DEFAUT'::public."clientstatus"
                ELSE 'ACTIF'::public."clientstatus"
            END,
            c.email, c.telephone
        FROM silver_clients c
        ON CONFLICT (id) DO NOTHING
    """))
    print("clients done")

    # Engagements (only for valid clients)
    conn.execute(text("""
        INSERT INTO engagements (ref, client_id, client_nom, type_credit, montant, duree, taux, score, statut, date_depot, agence_id)
        SELECT e.ref, e.client_id, e.client_nom,
            CASE e.type_credit
                WHEN 'Mourabaha Immo' THEN 'MOURABAHA_IMMO'::public."credittype"
                WHEN 'Ijara' THEN 'IJARA'::public."credittype"
                WHEN 'Mourabaha Auto' THEN 'MOURABAHA_AUTO'::public."credittype"
                WHEN 'Credit Tresorerie' THEN 'CREDIT_TRESO'::public."credittype"
                WHEN 'Investissement PME' THEN 'INVESTISSEMENT_PME'::public."credittype"
                ELSE NULL
            END,
            COALESCE(e.montant, 0), COALESCE(e.duree, 12), COALESCE(e.taux, 5.0), COALESCE(e.score, 50),
            CASE e.statut
                WHEN 'En analyse' THEN 'EN_ANALYSE'::public."engagementstatus"
                WHEN 'Valide' THEN 'VALIDE'::public."engagementstatus"
                WHEN 'Debloque' THEN 'DEBLOQUE'::public."engagementstatus"
                WHEN 'Surveillance' THEN 'SURVEILLANCE'::public."engagementstatus"
                WHEN 'Contentieux' THEN 'CONTENTIEUX'::public."engagementstatus"
                ELSE 'EN_ANALYSE'::public."engagementstatus"
            END,
            e.ingested_at, e.agence_id
        FROM silver_engagements e
        WHERE EXISTS (SELECT 1 FROM clients c WHERE c.id = e.client_id)
        ON CONFLICT (ref) DO NOTHING
    """))
    print("engagements done")

    conn.commit()
print("Done!")
