from typing import List, Dict, Any
from datetime import datetime
import re


VALID_SEGMENTS = {"Particuliers", "Professionnels", "PME", "Grandes Entreprises", "Bancassurance"}
VALID_STATUTS_CLIENT = {"Actif", "Defaut", "A risque"}
VALID_STATUTS_ENGAGEMENT = {"Valide", "Debloque", "Surveillance", "Contentieux", "En analyse"}
VALID_TYPES_CREDIT = {"Mourabaha Immo", "Mourabaha Auto", "Ijara", "Credit Tresorerie", "Investissement PME"}
VALID_ROLES = {"DG", "DR", "CA", "ADMIN", "AR"}


def _to_float(val: Any) -> float | None:
    if val is None:
        return None
    s = str(val).strip()
    if s == "" or s == "None":
        return None
    try:
        return float(s)
    except (ValueError, TypeError):
        return None


def _to_int(val: Any) -> int | None:
    if val is None:
        return None
    s = str(val).strip()
    if s == "" or s == "None":
        return None
    try:
        return int(float(s))
    except (ValueError, TypeError):
        return None


def _is_valid_email(val: Any) -> bool:
    if val is None:
        return False
    s = str(val).strip()
    return bool(re.match(r"[^@]+@[^@]+\.[^@]+", s))


class SilverTransformer:

    def __init__(self):
        self.agence_ids: set = set()
        self.client_ids: set = set()

    def _add_tech_cols(self, row: Dict[str, Any], is_valid: bool, errors: List[str]) -> Dict[str, Any]:
        row["is_valid"] = is_valid
        row["error_message"] = "; ".join(errors) if errors else None
        row["ingested_at"] = datetime.now()
        return row

    def validate_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        errors = []
        user = dict(user)

        if not user.get("nom") or str(user["nom"]).strip() == "":
            errors.append("Nom vide")

        if not _is_valid_email(user.get("email")):
            errors.append("Email invalide")
            user["email"] = None

        role = str(user.get("role", "")).strip()
        if role not in VALID_ROLES:
            errors.append(f"Role inconnu: {role}")
        user["role"] = role

        return self._add_tech_cols(user, len(errors) == 0, errors)

    def validate_agence(self, agence: Dict[str, Any]) -> Dict[str, Any]:
        errors = []
        agence = dict(agence)

        if not agence.get("nom") or str(agence["nom"]).strip() == "":
            errors.append("Nom agence vide")

        if not agence.get("ville") or str(agence["ville"]).strip() == "":
            errors.append("Ville vide")

        if not agence.get("region") or str(agence["region"]).strip() == "":
            errors.append("Region vide")

        aid = agence.get("id")
        if aid:
            self.agence_ids.add(str(aid).strip())

        return self._add_tech_cols(agence, len(errors) == 0, errors)

    def validate_client(self, client: Dict[str, Any]) -> Dict[str, Any]:
        errors = []
        client = dict(client)

        cid = client.get("id")
        if cid:
            self.client_ids.add(str(cid).strip())

        if not client.get("nom") or str(client["nom"]).strip() == "":
            errors.append("Nom client vide")

        segment = str(client.get("segment", "")).strip()
        if segment == "":
            errors.append("Segment vide")
        elif segment not in VALID_SEGMENTS:
            errors.append(f"Segment inconnu: {segment}")
        client["segment"] = segment if segment in VALID_SEGMENTS else None

        score = _to_int(client.get("score"))
        if score is None:
            errors.append("Score vide")
            client["score"] = None
        elif score < 0:
            errors.append(f"Score negatif: {score}")
            client["score"] = 0
        elif score > 100:
            errors.append(f"Score > 100: {score}")
            client["score"] = 100
        else:
            client["score"] = score

        encours = _to_float(client.get("encours"))
        if encours is None:
            errors.append("Encours vide")
            client["encours"] = 0
        elif encours < 0:
            errors.append(f"Encours negatif: {encours}")
            client["encours"] = 0
        elif encours > 50_000_000:
            errors.append(f"Encours aberrant: {encours}")
        client["encours"] = encours if encours is not None else 0

        email = str(client.get("email") or "").strip()
        if email == "":
            errors.append("Email vide")
        elif not _is_valid_email(email):
            errors.append(f"Email invalide: {email}")
            client["email"] = None
        else:
            client["email"] = email

        statut = str(client.get("statut", "")).strip()
        if statut == "":
            errors.append("Statut vide")
        elif statut not in VALID_STATUTS_CLIENT:
            errors.append(f"Statut inconnu: {statut}")
        client["statut"] = statut if statut in VALID_STATUTS_CLIENT else None

        agence_id = str(client.get("agence_id") or "").strip()
        if agence_id == "":
            errors.append("Agence_id vide")
        client["agence_id"] = agence_id or None

        return self._add_tech_cols(client, len(errors) == 0, errors)

    def validate_engagement(self, engagement: Dict[str, Any]) -> Dict[str, Any]:
        errors = []
        engagement = dict(engagement)

        ref = str(engagement.get("ref") or "").strip()
        if ref == "":
            errors.append("Ref vide")
        engagement["ref"] = ref

        if not engagement.get("client_id") or str(engagement["client_id"]).strip() == "":
            errors.append("Client_id vide")

        if not engagement.get("client_nom") or str(engagement["client_nom"]).strip() == "":
            errors.append("Client_nom vide")

        type_c = str(engagement.get("type_credit", "")).strip()
        if type_c == "":
            errors.append("Type credit vide")
        elif type_c not in VALID_TYPES_CREDIT:
            errors.append(f"Type credit inconnu: {type_c}")
        engagement["type_credit"] = type_c if type_c in VALID_TYPES_CREDIT else None

        montant = _to_float(engagement.get("montant"))
        if montant is None:
            errors.append("Montant vide")
        elif montant < 0:
            errors.append(f"Montant negatif: {montant}")
        engagement["montant"] = montant

        duree = _to_int(engagement.get("duree"))
        if duree is None:
            errors.append("Duree vide")
        elif duree <= 0:
            errors.append(f"Duree invalide: {duree}")
        engagement["duree"] = duree

        taux = _to_float(engagement.get("taux"))
        if taux is None:
            errors.append("Taux vide")
        elif taux <= 0:
            errors.append(f"Taux invalide: {taux}")
        engagement["taux"] = taux

        score = _to_int(engagement.get("score"))
        if score is None:
            errors.append("Score vide")
            engagement["score"] = None
        elif score < 0:
            errors.append(f"Score negatif: {score}")
            engagement["score"] = 0
        elif score > 100:
            errors.append(f"Score > 100: {score}")
            engagement["score"] = 100
        else:
            engagement["score"] = score

        statut = str(engagement.get("statut", "")).strip()
        if statut == "":
            errors.append("Statut vide")
        elif statut not in VALID_STATUTS_ENGAGEMENT:
            errors.append(f"Statut inconnu: {statut}")
        engagement["statut"] = statut if statut in VALID_STATUTS_ENGAGEMENT else None

        agence_id = str(engagement.get("agence_id") or "").strip()
        if agence_id == "":
            errors.append("Agence_id vide")
        engagement["agence_id"] = agence_id or None

        return self._add_tech_cols(engagement, len(errors) == 0, errors)

    def deduplicate(self, data: List[Dict[str, Any]], key: str) -> List[Dict[str, Any]]:
        seen = set()
        unique = []
        for item in data:
            k = item.get(key)
            if k not in seen:
                seen.add(k)
                unique.append(item)
        return unique

    def transform_all(self, bronze_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, List[Dict[str, Any]]]:
        self.agence_ids = set()
        self.client_ids = set()

        agences = [self.validate_agence(a) for a in bronze_data.get("agences", [])]
        users = [self.validate_user(u) for u in bronze_data.get("users", [])]
        clients = [self.validate_client(c) for c in bronze_data.get("clients", [])]
        engagements = [self.validate_engagement(e) for e in bronze_data.get("engagements", [])]

        return {
            "users": self.deduplicate(users, "id"),
            "agences": self.deduplicate(agences, "id"),
            "clients": self.deduplicate(clients, "id"),
            "engagements": self.deduplicate(engagements, "ref"),
        }
