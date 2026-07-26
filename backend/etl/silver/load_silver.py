from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from typing import List, Dict, Any
from app.config import settings


class SilverLoader:

    def __init__(self):
        self.engine = create_engine(settings.DATABASE_URL)
        self.SessionLocal = sessionmaker(bind=self.engine)

    def create_tables(self):
        with self.engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS silver_agences (
                    id VARCHAR(50) PRIMARY KEY,
                    nom VARCHAR(100),
                    ville VARCHAR(50),
                    region VARCHAR(50),
                    directeur VARCHAR(100),
                    telephone VARCHAR(20),
                    email VARCHAR(100),
                    is_valid BOOLEAN DEFAULT TRUE,
                    error_message TEXT,
                    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS silver_users (
                    id VARCHAR(50) PRIMARY KEY,
                    email VARCHAR(100),
                    nom VARCHAR(100),
                    role VARCHAR(20),
                    is_active BOOLEAN DEFAULT TRUE,
                    hashed_password VARCHAR(255),
                    is_valid BOOLEAN DEFAULT TRUE,
                    error_message TEXT,
                    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS silver_clients (
                    id VARCHAR(50) PRIMARY KEY,
                    nom VARCHAR(100),
                    segment VARCHAR(50),
                    agence_id VARCHAR(50),
                    encours DECIMAL(15,2) DEFAULT 0,
                    score INTEGER,
                    statut VARCHAR(50),
                    email VARCHAR(100),
                    telephone VARCHAR(20),
                    is_valid BOOLEAN DEFAULT TRUE,
                    error_message TEXT,
                    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS silver_engagements (
                    ref VARCHAR(50) PRIMARY KEY,
                    client_id VARCHAR(50),
                    client_nom VARCHAR(100),
                    type_credit VARCHAR(50),
                    montant DECIMAL(15,2),
                    duree INTEGER,
                    taux DECIMAL(5,2),
                    score INTEGER,
                    statut VARCHAR(50),
                    date_depot TIMESTAMP,
                    agence_id VARCHAR(50),
                    is_valid BOOLEAN DEFAULT TRUE,
                    error_message TEXT,
                    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
        print("  [OK] Tables silver creees")

    def _bulk_insert(self, table: str, rows: List[Dict[str, Any]], columns: List[str]) -> int:
        if not rows:
            return 0
        session = self.SessionLocal()
        count = 0
        for row in rows:
            cleaned = {k: row.get(k) for k in columns}
            try:
                with session.begin_nested():
                    placeholders = ", ".join([f":{c}" for c in columns])
                    col_names = ", ".join(columns)
                    session.execute(
                        text(f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"),
                        cleaned
                    )
                count += 1
            except Exception as e_row:
                print(f"  [WARN] Ligne ignoree ({table} {row.get('id', row.get('ref', '?'))}) : {e_row}")
        try:
            session.commit()
        except Exception as e:
            session.rollback()
            print(f"  [ERR] {table} commit : {e}")
            return 0
        finally:
            session.close()
        return count

    def load_agences(self, agences: List[Dict[str, Any]]) -> int:
        cols = ["id", "nom", "ville", "region", "directeur", "telephone", "email", "is_valid", "error_message", "ingested_at"]
        return self._bulk_insert("silver_agences", agences, cols)

    def load_users(self, users: List[Dict[str, Any]]) -> int:
        cols = ["id", "email", "nom", "role", "is_active", "hashed_password", "is_valid", "error_message", "ingested_at"]
        return self._bulk_insert("silver_users", users, cols)

    def load_clients(self, clients: List[Dict[str, Any]]) -> int:
        cols = ["id", "nom", "segment", "agence_id", "encours", "score", "statut", "email", "telephone", "is_valid", "error_message", "ingested_at"]
        return self._bulk_insert("silver_clients", clients, cols)

    def load_engagements(self, engagements: List[Dict[str, Any]]) -> int:
        cols = ["ref", "client_id", "client_nom", "type_credit", "montant", "duree", "taux", "score", "statut", "date_depot", "agence_id", "is_valid", "error_message", "ingested_at"]
        return self._bulk_insert("silver_engagements", engagements, cols)

    def load_all(self, data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, int]:
        return {
            "agences": self.load_agences(data.get("agences", [])),
            "users": self.load_users(data.get("users", [])),
            "clients": self.load_clients(data.get("clients", [])),
            "engagements": self.load_engagements(data.get("engagements", [])),
        }

    def truncate_all(self):
        with self.engine.connect() as conn:
            for table in ["silver_engagements", "silver_clients", "silver_users", "silver_agences"]:
                conn.execute(text(f"TRUNCATE TABLE {table} CASCADE"))
            conn.commit()
        print("  [OK] Tables silver videes")
