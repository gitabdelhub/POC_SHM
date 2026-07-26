from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.agence import Agence
from app.schemas.agence import AgenceCreate, AgenceResponse, AgenceUpdate

router = APIRouter()


@router.get("/", response_model=List[AgenceResponse])
async def list_agences(
    skip: int = 0,
    limit: int = 100,
    ville: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Agence)
    if ville:
        query = query.filter(Agence.ville == ville)
    if region:
        query = query.filter(Agence.region == region)
    return query.offset(skip).limit(limit).all()


@router.get("/{agence_id}", response_model=AgenceResponse)
async def get_agence(agence_id: str, db: Session = Depends(get_db)):
    agence = db.query(Agence).filter(Agence.id == agence_id).first()
    if not agence:
        raise HTTPException(status_code=404, detail="Agence non trouvée")
    return agence


@router.post("/", response_model=AgenceResponse)
async def create_agence(agence: AgenceCreate, db: Session = Depends(get_db)):
    db_agence = Agence(**agence.model_dump())
    db.add(db_agence)
    db.commit()
    db.refresh(db_agence)
    return db_agence


@router.put("/{agence_id}", response_model=AgenceResponse)
async def update_agence(agence_id: str, agence_update: AgenceUpdate, db: Session = Depends(get_db)):
    agence = db.query(Agence).filter(Agence.id == agence_id).first()
    if not agence:
        raise HTTPException(status_code=404, detail="Agence non trouvée")
    for key, value in agence_update.model_dump(exclude_unset=True).items():
        setattr(agence, key, value)
    db.commit()
    db.refresh(agence)
    return agence


@router.delete("/{agence_id}")
async def delete_agence(agence_id: str, db: Session = Depends(get_db)):
    agence = db.query(Agence).filter(Agence.id == agence_id).first()
    if not agence:
        raise HTTPException(status_code=404, detail="Agence non trouvée")
    db.delete(agence)
    db.commit()
    return {"message": "Agence supprimée"}
