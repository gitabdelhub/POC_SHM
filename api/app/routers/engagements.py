from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.engagement import Engagement
from app.schemas.engagement import EngagementCreate, EngagementResponse, EngagementUpdate

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/", response_model=List[EngagementResponse])
async def list_engagements(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[str] = None,
    type_credit: Optional[str] = None,
    statut: Optional[str] = None,
    agence_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Engagement)
    if client_id:
        query = query.filter(Engagement.client_id == client_id)
    if type_credit:
        query = query.filter(Engagement.type_credit == type_credit)
    if statut:
        query = query.filter(Engagement.statut == statut)
    if agence_id:
        query = query.filter(Engagement.agence_id == agence_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{ref}", response_model=EngagementResponse)
async def get_engagement(ref: str, db: Session = Depends(get_db)):
    engagement = db.query(Engagement).filter(Engagement.ref == ref).first()
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement non trouvé")
    return engagement


@router.post("/", response_model=EngagementResponse)
async def create_engagement(engagement: EngagementCreate, db: Session = Depends(get_db)):
    db_engagement = Engagement(**engagement.model_dump())
    db.add(db_engagement)
    db.commit()
    db.refresh(db_engagement)
    return db_engagement


@router.put("/{ref}", response_model=EngagementResponse)
async def update_engagement(ref: str, engagement_update: EngagementUpdate, db: Session = Depends(get_db)):
    engagement = db.query(Engagement).filter(Engagement.ref == ref).first()
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement non trouvé")
    for key, value in engagement_update.model_dump(exclude_unset=True).items():
        setattr(engagement, key, value)
    db.commit()
    db.refresh(engagement)
    return engagement


@router.delete("/{ref}")
async def delete_engagement(ref: str, db: Session = Depends(get_db)):
    engagement = db.query(Engagement).filter(Engagement.ref == ref).first()
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement non trouvé")
    db.delete(engagement)
    db.commit()
    return {"message": "Engagement supprimé"}
