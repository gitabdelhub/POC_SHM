from typing import Any, Dict, List

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.config import settings


class GoldLoader:

    def __init__(self):
        self.engine = create_engine(settings.DATABASE_URL)
        self.SessionLocal = sessionmaker(bind=self.engine)

    def create_tables(self):
        with self.engine.connect() as conn:
            conn.execute(text("""
                DROP TABLE IF EXISTS fact_risque CASCADE;
                DROP TABLE IF EXISTS fact_qualite CASCADE;
                DROP TABLE IF EXISTS fact_performance CASCADE;
                DROP TABLE IF EXISTS fact_engagement CASCADE;
                DROP TABLE IF EXISTS dim_utilisateur CASCADE;
                DROP TABLE IF EXISTS dim_type_credit CASCADE;
                DROP TABLE IF EXISTS dim_agence CASCADE;
                DROP TABLE IF EXISTS dim_client CASCADE;
                DROP TABLE IF EXISTS dim_date CASCADE;
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS dim_date (
                    date_id INTEGER PRIMARY KEY,
                    annee INTEGER NOT NULL,
                    mois INTEGER NOT NULL,
                    mois_libelle VARCHAR(20) NOT NULL,
                    trimestre INTEGER NOT NULL,
                    semestre INTEGER NOT NULL,
                    annee_mois VARCHAR(7) NOT NULL
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS dim_client (
                    client_id VARCHAR(50) PRIMARY KEY,
                    nom VARCHAR(100),
                    segment VARCHAR(50),
                    email VARCHAR(100),
                    telephone VARCHAR(20),
                    agence_id VARCHAR(50),
                    ville VARCHAR(50),
                    encours_actuel DECIMAL(15,2),
                    score_actuel INTEGER,
                    statut_actuel VARCHAR(50)
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS dim_agence (
                    agence_id VARCHAR(50) PRIMARY KEY,
                    nom VARCHAR(100),
                    ville VARCHAR(50),
                    region VARCHAR(50),
                    directeur VARCHAR(100),
                    telephone VARCHAR(20),
                    email VARCHAR(100)
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS dim_type_credit (
                    type_credit_id VARCHAR(20) PRIMARY KEY,
                    libelle VARCHAR(100) NOT NULL,
                    famille VARCHAR(50) NOT NULL
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS dim_utilisateur (
                    user_id VARCHAR(50) PRIMARY KEY,
                    nom VARCHAR(100),
                    email VARCHAR(100),
                    role VARCHAR(20),
                    is_active BOOLEAN DEFAULT TRUE
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS fact_engagement (
                    engagement_id VARCHAR(50) PRIMARY KEY,
                    client_id VARCHAR(50),
                    type_credit_id VARCHAR(20),
                    agence_id VARCHAR(50),
                    montant DECIMAL(15,2),
                    duree_mois INTEGER,
                    taux DECIMAL(5,2),
                    score INTEGER,
                    statut VARCHAR(50),
                    annee_mois_depot VARCHAR(7)
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS fact_performance (
                    performance_id VARCHAR(50) PRIMARY KEY,
                    agence_id VARCHAR(50),
                    date_id INTEGER,
                    pnb DECIMAL(15,2),
                    encours_credits DECIMAL(15,2),
                    encours_depots DECIMAL(15,2),
                    npl_ratio DECIMAL(5,2),
                    nim DECIMAL(15,2),
                    ratio_credits_depots DECIMAL(5,2),
                    ratio_realisation DECIMAL(5,2)
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS fact_qualite (
                    qualite_id VARCHAR(50) PRIMARY KEY,
                    agence_id VARCHAR(50),
                    date_id INTEGER,
                    note_satisfaction_client INTEGER,
                    reclamations_ouvertes INTEGER,
                    reclamations_traitees INTEGER,
                    delai_resolution_moyen INTEGER,
                    traitement_rate DECIMAL(5,2)
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS fact_risque (
                    risque_id VARCHAR(50) PRIMARY KEY,
                    client_id VARCHAR(50),
                    date_id INTEGER,
                    score_risque INTEGER,
                    classe_risque VARCHAR(5),
                    classe_libelle VARCHAR(20),
                    npl_flag BOOLEAN
                )
            """))
            conn.commit()
        print("  [OK] Tables Gold creees")

    def _upsert_all(self, table: str, rows: List[Dict[str, Any]], pk: str):
        if not rows:
            return 0
        session = self.SessionLocal()
        count = 0
        for row in rows:
            cols = list(row.keys())
            placeholders = ", ".join([f":{c}" for c in cols])
            col_names = ", ".join(cols)
            updates = ", ".join([f"{c} = EXCLUDED.{c}" for c in cols if c != pk])
            sql = text(f"""
                INSERT INTO {table} ({col_names}) VALUES ({placeholders})
                ON CONFLICT ({pk}) DO UPDATE SET {updates}
            """)
            try:
                session.execute(sql, row)
                count += 1
            except Exception as e:
                print(f"  [WARN] {table} {row.get(pk, '?')}: {e}")
        try:
            session.commit()
        except Exception as e:
            session.rollback()
            print(f"  [ERR] {table} commit: {e}")
        finally:
            session.close()
        return count

    def load_dim_date(self, rows: List[Dict[str, Any]]) -> int:
        return self._upsert_all("dim_date", rows, "date_id")

    def load_dim_client(self, rows: List[Dict[str, Any]]) -> int:
        return self._upsert_all("dim_client", rows, "client_id")

    def load_dim_agence(self, rows: List[Dict[str, Any]]) -> int:
        return self._upsert_all("dim_agence", rows, "agence_id")

    def load_dim_type_credit(self, rows: List[Dict[str, Any]]) -> int:
        return self._upsert_all("dim_type_credit", rows, "type_credit_id")

    def load_dim_utilisateur(self, rows: List[Dict[str, Any]]) -> int:
        return self._upsert_all("dim_utilisateur", rows, "user_id")

    def load_fact_engagement(self, rows: List[Dict[str, Any]]) -> int:
        return self._upsert_all("fact_engagement", rows, "engagement_id")

    def load_fact_performance(self, rows: List[Dict[str, Any]]) -> int:
        return self._upsert_all("fact_performance", rows, "performance_id")

    def load_fact_qualite(self, rows: List[Dict[str, Any]]) -> int:
        return self._upsert_all("fact_qualite", rows, "qualite_id")

    def load_fact_risque(self, rows: List[Dict[str, Any]]) -> int:
        return self._upsert_all("fact_risque", rows, "risque_id")

    def load_all(self, data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, int]:
        return {
            "dim_date": self.load_dim_date(data.get("dim_date", [])),
            "dim_client": self.load_dim_client(data.get("dim_client", [])),
            "dim_agence": self.load_dim_agence(data.get("dim_agence", [])),
            "dim_type_credit": self.load_dim_type_credit(data.get("dim_type_credit", [])),
            "dim_utilisateur": self.load_dim_utilisateur(data.get("dim_utilisateur", [])),
            "fact_engagement": self.load_fact_engagement(data.get("fact_engagement", [])),
            "fact_performance": self.load_fact_performance(data.get("fact_performance", [])),
            "fact_qualite": self.load_fact_qualite(data.get("fact_qualite", [])),
            "fact_risque": self.load_fact_risque(data.get("fact_risque", [])),
        }

    def truncate_all(self):
        tables = [
            "fact_risque", "fact_qualite", "fact_performance", "fact_engagement",
            "dim_utilisateur", "dim_type_credit", "dim_agence", "dim_client", "dim_date"
        ]
        with self.engine.connect() as conn:
            for t in tables:
                conn.execute(text(f"TRUNCATE TABLE {t} CASCADE"))
            conn.commit()
        print("  [OK] Tables Gold videes")
