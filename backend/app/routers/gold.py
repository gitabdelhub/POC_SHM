from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import create_engine, text

from app.config import settings
from app.core.deps import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])
engine = create_engine(settings.DATABASE_URL)


def run_sql(q: str, params: dict = None):
    with engine.connect() as conn:
        rows = conn.execute(text(q), params or {}).fetchall()
        return [dict(r._mapping) for r in rows]


@router.get("/kpis")
async def kpis():
    row = run_sql("""
        SELECT
            COUNT(DISTINCT fc.client_id) as total_clients,
            COALESCE(SUM(fc.montant), 0) as total_encours,
            (SELECT COALESCE(SUM(pnb), 0) FROM fact_performance) as total_pnb,
            (SELECT COALESCE(SUM(encours_depots), 0) FROM fact_performance) as total_depots,
            (SELECT COALESCE(AVG(npl_ratio), 0) FROM fact_performance) as npl_moyen,
            COUNT(DISTINCT fa.agence_id) as total_agences
        FROM fact_engagement fc
        JOIN dim_agence fa ON fc.agence_id = fa.agence_id
    """)
    return row[0] if row else {}


@router.get("/clients")
async def clients():
    return run_sql("""
        SELECT client_id as id, nom, segment, agence_id, ville,
               encours_actuel as encours, score_actuel as score, statut_actuel as statut
        FROM dim_client
        ORDER BY encours_actuel DESC
        LIMIT 100
    """)


@router.get("/engagements")
async def engagements():
    return run_sql("""
        SELECT fe.engagement_id as ref, dc.nom as client, dtc.libelle as type,
               fe.montant, fe.duree_mois as duree, fe.taux, fe.score, fe.statut
        FROM fact_engagement fe
        LEFT JOIN dim_client dc ON fe.client_id = dc.client_id
        LEFT JOIN dim_type_credit dtc ON fe.type_credit_id = dtc.type_credit_id
        ORDER BY fe.montant DESC
        LIMIT 100
    """)


@router.get("/pnb-mensuel")
async def pnb_mensuel(annee: Optional[int] = None):
    q = """
        SELECT dd.annee_mois, SUM(fp.pnb) as pnb
        FROM fact_performance fp
        JOIN dim_date dd ON fp.date_id = dd.date_id
    """
    params = {}
    if annee:
        q += " WHERE dd.annee = :annee"
        params["annee"] = annee
    q += " GROUP BY dd.annee_mois ORDER BY dd.annee_mois"
    return run_sql(q, params)


@router.get("/credits-par-type")
async def credits_par_type():
    return run_sql("""
        SELECT dtc.libelle as label, COUNT(*) as value
        FROM fact_engagement fe
        JOIN dim_type_credit dtc ON fe.type_credit_id = dtc.type_credit_id
        GROUP BY dtc.libelle ORDER BY value DESC
    """)


@router.get("/clients-par-statut")
async def clients_par_statut():
    return run_sql("""
        SELECT statut_actuel as statut, COUNT(*) as count
        FROM dim_client
        GROUP BY statut_actuel ORDER BY count DESC
    """)


@router.get("/engagements-par-statut")
async def engagements_par_statut():
    return run_sql("""
        SELECT statut, COUNT(*) as count
        FROM fact_engagement
        GROUP BY statut ORDER BY count DESC
    """)


@router.get("/risque-par-classe")
async def risque_par_classe():
    return run_sql("""
        SELECT classe_libelle, COUNT(*) as count
        FROM fact_risque
        WHERE npl_flag = true
        GROUP BY classe_libelle ORDER BY count DESC
    """)


@router.get("/performance-agences")
async def performance_agences():
    return run_sql("""
        SELECT da.nom as agence, da.ville, da.region,
               AVG(fp.pnb) as pnb_moyen,
               AVG(fp.npl_ratio) as npl_ratio,
               AVG(fp.nim) as nim_moyen,
               AVG(fp.ratio_realisation) as ratio_realisation
        FROM fact_performance fp
        JOIN dim_agence da ON fp.agence_id = da.agence_id
        GROUP BY da.nom, da.ville, da.region
        ORDER BY pnb_moyen DESC
    """)


@router.get("/qualite-agences")
async def qualite_agences():
    return run_sql("""
        SELECT da.nom as agence,
               AVG(fq.note_satisfaction_client) as satisfaction_moyenne,
               SUM(fq.reclamations_ouvertes) as total_reclamations,
               AVG(fq.delai_resolution_moyen) as delai_moyen
        FROM fact_qualite fq
        JOIN dim_agence da ON fq.agence_id = da.agence_id
        GROUP BY da.nom ORDER BY satisfaction_moyenne DESC
    """)


@router.get("/encours-par-region")
async def encours_par_region():
    return run_sql("""
        SELECT da.agence_id, da.nom as agence, da.ville, da.region,
               COALESCE(SUM(fp.encours_credits), 0) as encours_credits,
               COALESCE(SUM(fp.encours_depots), 0) as encours_depots,
               COALESCE(SUM(fp.encours_credits + fp.encours_depots), 0) as total_volume
        FROM dim_agence da
        LEFT JOIN fact_performance fp ON da.agence_id = fp.agence_id
        GROUP BY da.agence_id, da.nom, da.ville, da.region
        ORDER BY total_volume DESC
    """)

