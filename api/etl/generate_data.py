"""
Generateur de donnees bancaires marocaines realistes + anomalies
Output : CSV dans etl/data/
Un data engineer doit nettoyer tout ca dans la couche Silver
"""

import csv
import os
import random
from datetime import datetime

from faker import Faker

fake = Faker("fr_FR")

# Graine fixe pour un resultat reproductible (meme donnees a chaque generation)
SEED = 42
random.seed(SEED)
fake.seed_instance(SEED)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Probabilite d'anomalie (10% des donnees auront un defaut)
ANOMALY_RATE = 0.10

# ─── DISTRIBUTIONS ───
SEGMENTS = ["Particuliers", "PME", "Professionnels", "Grandes Entreprises", "Bancassurance"]
SEGMENT_WEIGHTS = [0.55, 0.25, 0.10, 0.06, 0.04]

SCORE_MEAN = {"Particuliers": 62, "PME": 52, "Professionnels": 68, "Grandes Entreprises": 75, "Bancassurance": 70}

ENCOURS_MIN = {"Particuliers": 10000, "PME": 200000, "Professionnels": 50000, "Grandes Entreprises": 2000000, "Bancassurance": 100000}
ENCOURS_MAX = {"Particuliers": 800000, "PME": 8000000, "Professionnels": 1500000, "Grandes Entreprises": 40000000, "Bancassurance": 3000000}

CREDIT_TYPES = ["Mourabaha Immo", "Ijara", "Mourabaha Auto", "Credit Tresorerie", "Investissement PME"]
CREDIT_WEIGHTS = [0.35, 0.20, 0.25, 0.12, 0.08]

ENG_STATUS = ["En analyse", "Valide", "Debloque", "Surveillance", "Contentieux"]
ENG_STATUS_WEIGHTS = [0.10, 0.25, 0.50, 0.10, 0.05]

VILLES = [
    ("Casablanca", "Casablanca-Settat"),
    ("Rabat", "Rabat-Sale-Kenitra"),
    ("Marrakech", "Marrakech-Safi"),
    ("Fes", "Fes-Meknes"),
    ("Tanger", "Tanger-Tetouan-Al Hoceima"),
    ("Agadir", "Souss-Massa"),
    ("Oujda", "L'Oriental"),
    ("Meknes", "Fes-Meknes"),
    ("Kenitra", "Rabat-Sale-Kenitra"),
    ("Tetouan", "Tanger-Tetouan-Al Hoceima"),
    ("Laayoune", "Laayoune-Sakia El Hamra"),
    ("Dakhla", "Dakhla-Oued Ed-Dahab"),
    ("Beni Mellal", "Beni Mellal-Khenifra"),
    ("Nador", "L'Oriental"),
    ("Errachidia", "Draa-Tafilalet"),
    ("Ouarzazate", "Draa-Tafilalet"),
]

PRENOMS_M = ["Mohamed", "Ahmed", "Hassan", "Abdellah", "Youssef", "Omar", "Khalid", "Hicham", "Rachid", "Mehdi", "Karim", "Amine", "Noureddine", "Said", "Driss"]
PRENOMS_F = ["Fatima", "Khadija", "Amina", "Nadia", "Samira", "Leila", "Soukaina", "Hind", "Salma", "Meryem", "Imane", "Asmaa", "Zineb"]
NOMS = ["Bennani", "Alaoui", "Idrissi", "El Fassi", "Benjelloun", "Tazi", "Balafrej", "Berrada", "Jai", "Hakim", "Erraji", "Fikri", "Ouazzani", "Guedira", "Kabbaj", "Mouline", "Slaoui", "Sbihi", "Zniber", "Lamrani", "El Amrani", "Bencheikh", "Fassi-Fihri"]

PHONE_PREFIXES = ["061", "062", "063", "064", "065", "066", "067", "068", "069", "070", "071", "072"]

def random_name():
    p = random.choice(PRENOMS_M + PRENOMS_F)
    n = random.choice(NOMS)
    return f"{p} {n}"

def random_phone():
    return f"0{random.choice(PHONE_PREFIXES)}{random.randint(10,99)}{random.randint(10,99)}{random.randint(10,99)}"

def inject_anomaly(row, fields, anomaly_type=None):
    """Ajoute une anomalie a un champ"""
    if anomaly_type is None:
        anomaly_type = random.choice(["null", "vide", "format", "outlier", "incoherent"])

    field = random.choice(fields)

    if anomaly_type == "null":
        row[field] = None
    elif anomaly_type == "vide":
        row[field] = ""
    elif anomaly_type == "format":
        if field in ["telephone", "phone", "tel"]:
            row["telephone"] = "0000000000"
        elif field == "email":
            row["email"] = "pas_un_email"
        elif field == "score":
            row["score"] = -5
    elif anomaly_type == "outlier":
        if field == "encours":
            row["encours"] = 999999999
        elif field == "score":
            row["score"] = 999
        elif field == "montant":
            row["montant"] = 0
    elif anomaly_type == "incoherent":
        if field == "statut":
            row["statut"] = "Inconnu"
        elif field == "segment":
            row["segment"] = "VIP"
    return row

# ─── GENERATEURS ───

def generate_agences(count=10):
    rows = []
    for i in range(min(count, len(VILLES))):
        ville, region = VILLES[i]
        r = {
            "id": f"AG-{i+1:03d}",
            "nom": f"Agence {ville} {'Centre' if i%2==0 else 'Principale'}",
            "ville": ville,
            "region": region,
            "directeur": random_name(),
            "telephone": random_phone(),
            "email": f"ag{ville.lower()[:3]}@sahambank.ma",
        }
        # 5% d'anomalies sur les agences
        if random.random() < 0.05:
            r = inject_anomaly(r, ["telephone", "email"])
        rows.append(r)
    return rows

VILLE_ECONOMIC_FACTOR = {
    "Casablanca": 2.6,   # Capitale économique & financière (leader indiscutable)
    "Rabat": 1.6,        # Capitale administrative
    "Tanger": 1.35,      # Hub industriel & portuaire
    "Marrakech": 1.15,   # Tourisme & commerce
    "Agadir": 0.90,      # Souss-Massa (Pêche, agro)
    "Fes": 0.80,         # Fès historique & artisanat
    "Meknes": 0.70,      # Meknès agro-industrie
    "Kenitra": 0.65,     # Kénitra zone franche
    "Oujda": 0.55,       # Oriental
    "Tetouan": 0.50,     # Tétouan
    "Nador": 0.45,       # Port Nador West Med
    "Beni Mellal": 0.40, # Tadla
    "Ouarzazate": 0.30,  # Sud
    "Errachidia": 0.28,  # Tafilalet
    "Laayoune": 0.25,    # Sahara
    "Dakhla": 0.22,      # Sud
}

VILLE_AGENCY_WEIGHTS = {
    "Casablanca": 0.32,  # 32% des clients nationaux
    "Rabat": 0.16,       # 16% des clients
    "Tanger": 0.12,      # 12% des clients
    "Marrakech": 0.10,   # 10% des clients
    "Agadir": 0.06,
    "Fes": 0.05,
    "Meknes": 0.04,
    "Kenitra": 0.03,
    "Oujda": 0.03,
    "Tetouan": 0.02,
    "Nador": 0.02,
    "Beni Mellal": 0.02,
    "Ouarzazate": 0.01,
    "Errachidia": 0.01,
    "Laayoune": 0.005,
    "Dakhla": 0.005,
}

def generate_clients(count=500, agences=None):
    if agences is None:
        agences = [{"id": "AG-001", "ville": "Casablanca"}]

    # Calculer les poids de sélection pour chaque agence selon sa ville
    ag_weights = [VILLE_AGENCY_WEIGHTS.get(a.get("ville", ""), 0.02) for a in agences]

    rows = []
    for i in range(count):
        selected_agence = random.choices(agences, weights=ag_weights, k=1)[0]
        v_name = selected_agence.get("ville", "Casablanca")
        econ_factor = VILLE_ECONOMIC_FACTOR.get(v_name, 1.0)

        segment = random.choices(SEGMENTS, weights=SEGMENT_WEIGHTS, k=1)[0]
        score = max(0, min(100, int(random.gauss(SCORE_MEAN[segment], 18))))

        # L'encours client reflète la puissance économique de la région
        encours_base = random.uniform(ENCOURS_MIN[segment], ENCOURS_MAX[segment])
        encours = round(encours_base * econ_factor, 2)

        # Statut coherent avec le score SAUF anomalies
        if score >= 60:
            status = "Actif"
        elif score >= 35:
            status = "A risque"
        else:
            status = "Defaut"

        email = f"client{i+1}@email.com"
        tel = random_phone()

        r = {
            "id": f"CLI-{10001+i}",
            "nom": random_name(),
            "segment": segment,
            "agence_id": selected_agence["id"],
            "encours": encours,
            "score": score,
            "statut": status,
            "email": email,
            "telephone": tel,
        }

        # 10% d'anomalies sur les clients
        if random.random() < ANOMALY_RATE:
            r = inject_anomaly(r, ["email", "telephone", "score", "encours", "statut", "segment"])

        rows.append(r)
    return rows

def generate_engagements(count=2000, clients=None):
    if clients is None:
        clients = [{"id": "CLI-10001", "segment": "Particuliers", "agence_id": "AG-001"}]

    # Créer un lookup client -> agence_id
    rows = []
    # Seasonal multiplier: higher in Q4, lower in Q1
    season_mult = {1: 0.7, 2: 0.75, 3: 0.85, 4: 1.0, 5: 0.95, 6: 1.1,
                   7: 1.05, 8: 0.8, 9: 1.0, 10: 1.2, 11: 1.3, 12: 1.4}

    for i in range(count):
        client = random.choice(clients)
        credit_type = random.choices(CREDIT_TYPES, weights=CREDIT_WEIGHTS, k=1)[0]

        # Facteur économique du client basé sur son agence
        aid = client.get("agence_id", "AG-001")
        # Récupérer l'indice d'agence pour déduire la ville approximative
        try:
            ag_idx = int(aid.split("-")[1]) - 1
            ville_name = VILLES[ag_idx][0] if 0 <= ag_idx < len(VILLES) else "Casablanca"
        except Exception:
            ville_name = "Casablanca"

        econ_factor = VILLE_ECONOMIC_FACTOR.get(ville_name, 1.0)

        # Montant coherent avec le type de credit & la taille économique
        if credit_type == "Mourabaha Immo":
            montant_base = random.gauss(600000 * econ_factor, 180000 * econ_factor)
        elif credit_type == "Ijara":
            montant_base = random.gauss(400000 * econ_factor, 140000 * econ_factor)
        elif credit_type == "Mourabaha Auto":
            montant_base = random.gauss(250000 * (0.8 + 0.2 * econ_factor), 70000)
        elif credit_type == "Credit Tresorerie":
            montant_base = random.gauss(300000 * econ_factor, 120000 * econ_factor)
        else:  # Investissement PME
            montant_base = random.gauss(1500000 * econ_factor, 450000 * econ_factor)

        # Duree coherente avec le type
        if credit_type in ["Mourabaha Immo", "Ijara"]:
            duree = random.choice([120, 180, 240])
        elif credit_type == "Mourabaha Auto":
            duree = random.choice([24, 36, 48, 60])
        elif credit_type == "Credit Tresorerie":
            duree = random.choice([12, 24, 36])
        else:
            duree = random.choice([36, 48, 60, 84])

        taux = round(random.uniform(3.5, 9.0), 2)
        score = random.randint(20, 95)

        status = random.choices(ENG_STATUS, weights=ENG_STATUS_WEIGHTS, k=1)[0]
        # Distribute dates evenly across 2023-2026 (strictly bounded by August 2026)
        year = random.choice([2023, 2024, 2025, 2026])
        if year == 2026:
            month = random.randint(1, 8)
            day = random.randint(1, 25 if month == 8 else 28)
        else:
            month = random.randint(1, 12)
            day = random.randint(1, 28)
        # Apply seasonality to montant
        season = season_mult[month]
        montant = round(max(25000, montant_base * season), 2)
        date_depot = datetime(year, month, day, random.randint(8, 17), random.randint(0, 59), random.randint(0, 59)).strftime("%Y-%m-%d %H:%M:%S")

        r = {
            "ref": f"ENG-{20001+i}",
            "client_id": client["id"],
            "client_nom": client.get("nom", "Inconnu"),
            "type_credit": credit_type,
            "montant": montant,
            "duree": duree,
            "taux": taux,
            "score": score,
            "statut": status,
            "date_depot": date_depot,
            "agence_id": client.get("agence_id", "AG-001"),
        }

        # 10% d'anomalies
        if random.random() < ANOMALY_RATE:
            r = inject_anomaly(r, ["montant", "duree", "taux", "score", "statut", "client_id"])

        rows.append(r)
    return rows

def generate_users(count=8):
    roles = ["DG", "DR", "CA", "AR", "ADMIN"]
    rows = []
    for i in range(count):
        name = random_name()
        email = name.lower().replace(" ", ".").replace("e","e").replace("e","e") + "@sahambank.ma"
        r = {
            "id": f"USR-{i+1:05d}",
            "email": email,
            "nom": name,
            "role": random.choice(roles),
            "is_active": "true",
            "hashed_password": "a_remplacer_par_bcrypt",
        }
        # 5% d'anomalies
        if random.random() < 0.05:
            r = inject_anomaly(r, ["email", "role"], "incoherent")
        rows.append(r)
    return rows

def generate_qualite(agences=None):
    if agences is None:
        agences = [{"id": "AG-001"}]
    agence_ids = [a["id"] for a in agences]
    rows = []
    for aid in agence_ids:
        for year in [2023, 2024, 2025, 2026]:
            max_month = 8 if year == 2026 else 12
            for month in range(1, max_month + 1):
                note_satisfaction = random.randint(30, 85)
                recl_ouvertes = random.randint(0, 20)
                recl_traitees = max(0, recl_ouvertes - random.randint(0, 5))
                delai = random.randint(1, 10)
                date_str = f"{year}-{month:02d}-01"
                r = {
                    "qualite_id": f"QUAL-{aid}-{year}-{month:02d}",
                    "agence_id": aid,
                    "date": date_str,
                    "note_satisfaction_client": note_satisfaction,
                    "reclamations_ouvertes": recl_ouvertes,
                    "reclamations_traitees": recl_traitees,
                    "delai_resolution_moyen": delai,
                }
                if random.random() < ANOMALY_RATE:
                    r = inject_anomaly(r, ["note_satisfaction_client", "date"])
                rows.append(r)
    return rows

def save_csv(filename, rows):
    path = os.path.join(OUTPUT_DIR, filename)
    if not rows:
        print(f"  !! {filename} : 0 lignes")
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"  OK {filename} : {len(rows)} lignes")

def main():
    print("Generation des donnees Saham Bank (avec anomalies)...\n")

    print("1 - Agences...")
    agences = generate_agences(16)
    save_csv("agences.csv", agences)

    print("2 - Clients...")
    clients = generate_clients(800, agences)
    save_csv("clients.csv", clients)

    print("3 - Engagements...")
    engagements = generate_engagements(3200, clients)
    save_csv("engagements.csv", engagements)

    print("4 - Utilisateurs...")
    users = generate_users(10)
    save_csv("users.csv", users)

    print("5 - Qualite CRM...")
    qualite = generate_qualite(agences)
    save_csv("crm.csv", qualite)

    print(f"\nTermine ! Fichiers dans : {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
