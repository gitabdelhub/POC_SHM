"""Seed des comptes de d�mo pour le login r�el (T4).

Cr�e/upsert une ligne user par r�4le avec un vrai mot de passe bcrypt,
pour que le frontend puisse appeler POST /auth/login de bout en bout.
Mot de passe commun : Demo2026!

Usage : python -m app.seed_demo
"""
from sqlalchemy import text

from app.core.security import hash_password
from app.database import engine

DEMO_ACCOUNTS = [
    {"id": "USR-DEMO-DG",    "email": "dg@sahambank.ma",    "nom": "Mehdi Tazi",      "role": "DG"},
    {"id": "USR-DEMO-DR",    "email": "dr@sahambank.ma",    "nom": "Youssef Berrada", "role": "DR"},
    {"id": "USR-DEMO-CA",    "email": "ca@sahambank.ma",    "nom": "Amine Benali",    "role": "CA"},
    {"id": "USR-DEMO-AR",    "email": "ar@sahambank.ma",    "nom": "Nadia Fassi",     "role": "AR"},
    {"id": "USR-DEMO-ADMIN", "email": "admin@sahambank.ma", "nom": "Meryem El Asri",  "role": "ADMIN"},
]
DEMO_PASSWORD = "Demo2026!"


def seed():
    hashed = hash_password(DEMO_PASSWORD)
    with engine.begin() as conn:
        for acc in DEMO_ACCOUNTS:
            conn.execute(text(
                """
                INSERT INTO users (id, email, nom, role, is_active, hashed_password)
                VALUES (:id, :email, :nom, :role, true, :hashed)
                ON CONFLICT (id) DO UPDATE SET
                    email = EXCLUDED.email,
                    nom = EXCLUDED.nom,
                    role = EXCLUDED.role,
                    hashed_password = EXCLUDED.hashed_password
                """
            ), {
                "id": acc["id"],
                "email": acc["email"],
                "nom": acc["nom"],
                "role": acc["role"],
                "hashed": hashed,
            })
    print(f"Seed OK : {len(DEMO_ACCOUNTS)} comptes (mot de passe: {DEMO_PASSWORD})")


if __name__ == "__main__":
    seed()
