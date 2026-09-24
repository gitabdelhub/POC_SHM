"""
Extraction Bronze Layer - Lecture des CSV
Remplace Faker par la lecture des fichiers CSV generes
"""

import csv
import os
from typing import Any, Dict, List

CSV_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
_REQUIRED_FILES = ("users.csv", "agences.csv", "clients.csv", "engagements.csv", "crm.csv")


class BronzeExtractor:
    """Lit les CSV generes et retourne des dictionnaires"""

    @staticmethod
    def _ensure_csv_seeded() -> None:
        if all(os.path.exists(os.path.join(CSV_DIR, name)) for name in _REQUIRED_FILES):
            return
        print("  [!] CSV manquants : génération automatique des données ETL...")
        from etl.generate_data import main as generate_data_main

        generate_data_main()

    @staticmethod
    def _read_csv(filename: str) -> List[Dict[str, Any]]:
        path = os.path.join(CSV_DIR, filename)
        if not os.path.exists(path):
            print(f"  [!] Fichier introuvable : {path}")
            return []
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            return [dict(row) for row in reader]

    def extract_users(self) -> List[Dict[str, Any]]:
        return self._read_csv("users.csv")

    def extract_agences(self) -> List[Dict[str, Any]]:
        return self._read_csv("agences.csv")

    def extract_clients(self) -> List[Dict[str, Any]]:
        return self._read_csv("clients.csv")

    def extract_engagements(self) -> List[Dict[str, Any]]:
        return self._read_csv("engagements.csv")

    def extract_qualite(self) -> List[Dict[str, Any]]:
        return self._read_csv("crm.csv")

    def extract_all(self) -> Dict[str, List[Dict[str, Any]]]:
        self._ensure_csv_seeded()
        return {
            "users": self.extract_users(),
            "agences": self.extract_agences(),
            "clients": self.extract_clients(),
            "engagements": self.extract_engagements(),
            "qualite": self.extract_qualite(),
        }
