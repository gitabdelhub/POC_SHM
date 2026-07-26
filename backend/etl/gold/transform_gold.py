import random
from typing import List, Dict, Any
from datetime import datetime, date, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.config import settings

SEASONAL_PNB = {1: 0.85, 2: 0.78, 3: 0.92, 4: 0.88, 5: 0.95, 6: 1.05,
                7: 1.10, 8: 0.82, 9: 1.02, 10: 1.15, 11: 1.25, 12: 1.35}

CREDIT_TYPES = [
    {"type_credit_id": "CT-001", "libelle": "Mourabaha Immo", "famille": "Mourabaha"},
    {"type_credit_id": "CT-002", "libelle": "Mourabaha Auto", "famille": "Mourabaha"},
    {"type_credit_id": "CT-003", "libelle": "Ijara", "famille": "Ijara"},
    {"type_credit_id": "CT-004", "libelle": "Credit Tresorerie", "famille": "Tresorerie"},
    {"type_credit_id": "CT-005", "libelle": "Investissement PME", "famille": "Investissement"},
]


class GoldTransformer:

    def __init__(self):
        self.engine = create_engine(settings.DATABASE_URL)
        self.SessionLocal = sessionmaker(bind=self.engine)

    def _fetch_silver(self, table: str) -> List[Dict[str, Any]]:
        session = self.SessionLocal()
        try:
            rows = session.execute(text(f"SELECT * FROM {table}")).fetchall()
            return [dict(r._mapping) for r in rows]
        finally:
            session.close()

    def build_dim_date(self) -> List[Dict[str, Any]]:
        rows = []
        start = date(2023, 1, 1)
        end = date(2026, 12, 31)
        d = start
        while d <= end:
            rows.append({
                "date_id": int(d.strftime("%Y%m%d")),
                "annee": d.year,
                "mois": d.month,
                "mois_libelle": d.strftime("%B"),
                "trimestre": (d.month - 1) // 3 + 1,
                "semestre": 1 if d.month <= 6 else 2,
                "annee_mois": f"{d.year}-{d.month:02d}",
            })
            d += timedelta(days=1)
        return rows

    def build_dim_client(self) -> List[Dict[str, Any]]:
        silver = self._fetch_silver("silver_clients")
        rows = []
        for s in silver:
            if not s.get("is_valid", True):
                continue
            ville = (s.get("agence_id") or "").replace("AG-", "")
            rows.append({
                "client_id": s["id"],
                "nom": s.get("nom", ""),
                "segment": s.get("segment"),
                "email": s.get("email"),
                "telephone": s.get("telephone"),
                "agence_id": s.get("agence_id"),
                "ville": f"Ville-{ville}",
                "encours_actuel": s.get("encours") or 0,
                "score_actuel": s.get("score"),
                "statut_actuel": s.get("statut"),
            })
        return rows

    def build_dim_agence(self) -> List[Dict[str, Any]]:
        silver = self._fetch_silver("silver_agences")
        rows = []
        for s in silver:
            rows.append({
                "agence_id": s["id"],
                "nom": s.get("nom", ""),
                "ville": s.get("ville", ""),
                "region": s.get("region", ""),
                "directeur": s.get("directeur"),
                "telephone": s.get("telephone"),
                "email": s.get("email"),
            })
        return rows

    def build_dim_type_credit(self) -> List[Dict[str, Any]]:
        return CREDIT_TYPES

    def build_dim_utilisateur(self) -> List[Dict[str, Any]]:
        silver = self._fetch_silver("silver_users")
        rows = []
        for s in silver:
            rows.append({
                "user_id": s["id"],
                "nom": s.get("nom", ""),
                "email": s.get("email", ""),
                "role": s.get("role", ""),
                "is_active": s.get("is_active", True),
            })
        return rows

    def build_fact_engagement(self, dim_clients: List[Dict[str, Any]],
                              dim_type_credits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        silver = self._fetch_silver("silver_engagements")
        tc_map = {tc["libelle"]: tc["type_credit_id"] for tc in dim_type_credits}
        client_set = {c["client_id"] for c in dim_clients}
        rows = []
        for s in silver:
            if not s.get("is_valid", True):
                continue
            cid = s.get("client_id", "")
            if cid not in client_set:
                continue
            tc = s.get("type_credit", "")
            tc_id = tc_map.get(tc, "CT-000")
            depot = s.get("date_depot")
            annee_mois = ""
            if depot:
                try:
                    dt = depot if isinstance(depot, datetime) else datetime.strptime(str(depot)[:10], "%Y-%m-%d")
                    annee_mois = f"{dt.year}-{dt.month:02d}"
                except (ValueError, TypeError):
                    pass
            rows.append({
                "engagement_id": s["ref"],
                "client_id": cid,
                "type_credit_id": tc_id,
                "agence_id": s.get("agence_id", ""),
                "montant": s.get("montant") or 0,
                "duree_mois": s.get("duree") or 0,
                "taux": s.get("taux") or 0,
                "score": s.get("score") or 50,
                "statut": s.get("statut", ""),
                "annee_mois_depot": annee_mois,
            })
        return rows

    def _get_annee_mois(self, dt_val) -> str:
        if dt_val is None:
            return ""
        try:
            if isinstance(dt_val, datetime):
                return f"{dt_val.year}-{dt_val.month:02d}"
            return str(dt_val)[:7]
        except (ValueError, TypeError):
            return ""

    def build_fact_performance(self, dim_agences: List[Dict[str, Any]],
                                dim_dates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        engagements = self._fetch_silver("silver_engagements")
        clients = self._fetch_silver("silver_clients")
        agence_ids = [a["agence_id"] for a in dim_agences]
        months = sorted(set(d["annee_mois"] for d in dim_dates))
        # Index engagements by month+agence for fast lookup
        eng_by_month_agence = {}
        for e in engagements:
            if not e.get("is_valid", True):
                continue
            am = self._get_annee_mois(e.get("date_depot"))
            if not am:
                continue
            aid = e.get("agence_id", "")
            key = (am, aid)
            if key not in eng_by_month_agence:
                eng_by_month_agence[key] = []
            eng_by_month_agence[key].append(e)
        rows = []
        for am in months:
            parts = am.split("-")
            yr, mo = int(parts[0]), int(parts[1])
            date_id = yr * 10000 + mo * 100 + 1
            season = SEASONAL_PNB.get(mo, 1.0)
            for aid in agence_ids:
                key = (am, aid)
                ag_eng = eng_by_month_agence.get(key, [])
                ag_cli = [c for c in clients if c.get("agence_id") == aid]
                total_credits = sum(float(e.get("montant") or 0) for e in ag_eng)
                npl_eng = [e for e in ag_eng if e.get("statut") in ("Surveillance", "Contentieux")]
                npl_total = sum(float(e.get("montant") or 0) for e in npl_eng)
                npl_ratio = round((npl_total / total_credits * 100) if total_credits > 0 else 0, 2)
                # PNB = 3.5% margin × seasonal factor + random noise
                base_pnb = total_credits * 0.035 * season
                noise = base_pnb * random.uniform(-0.05, 0.05)
                pnb = round(base_pnb + noise, 2)
                rows.append({
                    "performance_id": f"PERF-{aid}-{am}",
                    "agence_id": aid,
                    "date_id": date_id,
                    "pnb": pnb,
                    "encours_credits": round(total_credits, 2),
                    "encours_depots": round(total_credits * (1.15 + random.uniform(-0.05, 0.1)), 2),
                    "npl_ratio": npl_ratio,
                    "nim": round(total_credits * 0.045 * season if total_credits > 0 else 0, 2),
                    "ratio_credits_depots": round(random.uniform(75, 95) if total_credits > 0 else 0, 2),
                    "ratio_realisation": round(75 + random.uniform(-5, 20), 2) if ag_cli else 0,
                })
        return rows

    def build_fact_risque(self, dim_clients: List[Dict[str, Any]],
                           dim_dates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        engagements = self._fetch_silver("silver_engagements")
        months = sorted(set(d["annee_mois"] for d in dim_dates))
        rows = []
        for c in dim_clients:
            cid = c["client_id"]
            cli_eng = [e for e in engagements if e.get("client_id") == cid and e.get("is_valid", True)]
            score = c.get("score_actuel") or 50
            if score >= 70:
                cls_risk, cls_lib, npl = "A", "Faible", False
            elif score >= 40:
                cls_risk, cls_lib, npl = "B", "Moyen", False
            else:
                cls_risk, cls_lib, npl = "C", "Eleve", True
            for am in months[:3]:
                parts = am.split("-")
                yr, mo = int(parts[0]), int(parts[1])
                date_id = yr * 10000 + mo * 100 + 1
                rows.append({
                    "risque_id": f"RISK-{cid}-{am}",
                    "client_id": cid,
                    "date_id": date_id,
                    "score_risque": score,
                    "classe_risque": cls_risk,
                    "classe_libelle": cls_lib,
                    "npl_flag": npl,
                })
        return rows

    def build_fact_qualite(self, dim_agences: List[Dict[str, Any]],
                            dim_dates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        random.seed(42)
        months = sorted(set(d["annee_mois"] for d in dim_dates))
        rows = []
        for aid in [a["agence_id"] for a in dim_agences]:
            for am in months:
                parts = am.split("-")
                yr, mo = int(parts[0]), int(parts[1])
                date_id = yr * 10000 + mo * 100 + 1
                recl_ouvertes = random.randint(0, 20)
                recl_traitees = max(0, recl_ouvertes - random.randint(0, 5))
                rows.append({
                    "qualite_id": f"QUAL-{aid}-{am}",
                    "agence_id": aid,
                    "date_id": date_id,
                    "nps": random.randint(30, 85),
                    "reclamations_ouvertes": recl_ouvertes,
                    "reclamations_traitees": recl_traitees,
                    "delai_resolution_moyen": random.randint(1, 10),
                    "traitement_rate": round((recl_traitees / recl_ouvertes * 100) if recl_ouvertes > 0 else 100, 2),
                })
        return rows


def score_avg(clients: List[Dict[str, Any]]) -> float:
    scores = [float(c.get("score") or 0) for c in clients]
    return sum(scores) / len(scores) if scores else 0
