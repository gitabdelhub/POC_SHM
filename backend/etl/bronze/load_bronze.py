"""
Chargement Bronze Layer - Insertion dans PostgreSQL
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from typing import List, Dict, Any
from app.config import settings


class BronzeLoader:

    def __init__(self):
        self.engine = create_engine(settings.DATABASE_URL)
        self.SessionLocal = sessionmaker(bind=self.engine)

    def create_tables(self):
        with self.engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS bronze_agences (
                    id VARCHAR(50) PRIMARY KEY,
                    nom VARCHAR(100) NOT NULL,
                    ville VARCHAR(50) NOT NULL,
                    region VARCHAR(50) NOT NULL,
                    directeur VARCHAR(100),
                    telephone VARCHAR(20),
                    email VARCHAR(100)
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS bronze_clients (
                    id VARCHAR(50) PRIMARY KEY,
                    nom VARCHAR(100) NOT NULL,
                    segment VARCHAR(50) NOT NULL,
                    agence_id VARCHAR(50) NOT NULL,
                    encours DECIMAL(15,2) DEFAULT 0,
                    score INTEGER NOT NULL,
                    statut VARCHAR(50) NOT NULL,
                    email VARCHAR(100),
                    telephone VARCHAR(20)
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS bronze_engagements (
                    ref VARCHAR(50) PRIMARY KEY,
                    client_id VARCHAR(50) NOT NULL,
                    client_nom VARCHAR(100) NOT NULL,
                    type_credit VARCHAR(50) NOT NULL,
                    montant DECIMAL(15,2) NOT NULL,
                    duree INTEGER NOT NULL,
                    taux DECIMAL(5,2) NOT NULL,
                    score INTEGER NOT NULL,
                    statut VARCHAR(50) NOT NULL,
                    date_depot TIMESTAMP,
                    agence_id VARCHAR(50) NOT NULL
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS bronze_users (
                    id VARCHAR(50) PRIMARY KEY,
                    email VARCHAR(100) NOT NULL,
                    nom VARCHAR(100) NOT NULL,
                    role VARCHAR(20) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    hashed_password VARCHAR(255)
                )
            """))
            conn.commit()
        print("  [OK] Tables bronze creees")

    def load_agences(self, agences: List[Dict[str, Any]]) -> int:
        session = self.SessionLocal()
        try:
            for a in agences:
                session.execute(
                    text("""
                        INSERT INTO bronze_agences (id, nom, ville, region, directeur, telephone, email)
                        VALUES (:id, :nom, :ville, :region, :directeur, :telephone, :email)
                    """),
                    a
                )
            session.commit()
            return len(agences)
        except Exception as e:
            session.rollback()
            print(f"  [ERR] bronze_agences : {e}")
            return 0
        finally:
            session.close()

    def load_clients(self, clients: List[Dict[str, Any]]) -> int:
        session = self.SessionLocal()
        count = 0
        for c in clients:
            cleaned = self._clean_row(c, ["score", "encours"])
            try:
                with session.begin_nested():
                    session.execute(
                        text("""
                            INSERT INTO bronze_clients (id, nom, segment, agence_id, encours, score, statut, email, telephone)
                            VALUES (:id, :nom, :segment, :agence_id, :encours, :score, :statut, :email, :telephone)
                        """),
                        cleaned
                    )
                count += 1
            except Exception as e_row:
                print(f"  [WARN] Ligne ignoree (client {c.get('id','?')}) : {e_row}")
        try:
            session.commit()
            return count
        except Exception as e:
            session.rollback()
            print(f"  [ERR] bronze_clients commit : {e}")
            return 0
        finally:
            session.close()

    def load_engagements(self, engagements: List[Dict[str, Any]]) -> int:
        session = self.SessionLocal()
        count = 0
        for e in engagements:
            cleaned = self._clean_row(e, ["montant", "duree", "taux", "score"])
            try:
                with session.begin_nested():
                    session.execute(
                        text("""
                            INSERT INTO bronze_engagements (ref, client_id, client_nom, type_credit, montant, duree, taux, score, statut, date_depot, agence_id)
                            VALUES (:ref, :client_id, :client_nom, :type_credit, :montant, :duree, :taux, :score, :statut, :date_depot, :agence_id)
                        """),
                        cleaned
                    )
                count += 1
            except Exception as e_row:
                print(f"  [WARN] Ligne ignoree (engagement {e.get('ref','?')}) : {e_row}")
        try:
            session.commit()
            return count
        except Exception as e:
            session.rollback()
            print(f"  [ERR] bronze_engagements commit : {e}")
            return 0
        finally:
            session.close()

    def load_users(self, users: List[Dict[str, Any]]) -> int:
        session = self.SessionLocal()
        try:
            for u in users:
                session.execute(
                    text("""
                        INSERT INTO bronze_users (id, email, nom, role, is_active, hashed_password)
                        VALUES (:id, :email, :nom, :role, :is_active, :hashed_password)
                    """),
                    u
                )
            session.commit()
            return len(users)
        except Exception as e:
            session.rollback()
            print(f"  [ERR] bronze_users : {e}")
            return 0
        finally:
            session.close()

    def load_all(self, data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, int]:
        return {
            "agences": self.load_agences(data.get("agences", [])),
            "clients": self.load_clients(data.get("clients", [])),
            "engagements": self.load_engagements(data.get("engagements", [])),
            "users": self.load_users(data.get("users", [])),
        }

    @staticmethod
    def _clean_row(row: Dict[str, Any], numeric_fields: List[str]) -> Dict[str, Any]:
        """Convertit les chaines vides en None pour les champs numeriques"""
        cleaned = dict(row)
        for field in numeric_fields:
            if field in cleaned and (cleaned[field] is None or str(cleaned[field]).strip() == ""):
                cleaned[field] = None
        return cleaned

    def truncate_all(self):
        with self.engine.connect() as conn:
            for table in ["bronze_engagements", "bronze_clients", "bronze_agences", "bronze_users"]:
                conn.execute(text(f"TRUNCATE TABLE {table} CASCADE"))
            conn.commit()
        print("  [OK] Tables bronze videes")
