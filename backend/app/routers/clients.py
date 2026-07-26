from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientResponse, ClientUpdate

router = APIRouter()


@router.get("/", response_model=List[ClientResponse])
async def list_clients(
    skip: int = 0,
    limit: int = 100,
    segment: Optional[str] = None,
    agence_id: Optional[str] = None,
    statut: Optional[str] = None,
    score_min: Optional[int] = None,
    score_max: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Client)
    if segment:
        query = query.filter(Client.segment == segment)
    if agence_id:
        query = query.filter(Client.agence_id == agence_id)
    if statut:
        query = query.filter(Client.statut == statut)
    if score_min is not None:
        query = query.filter(Client.score >= score_min)
    if score_max is not None:
        query = query.filter(Client.score <= score_max)
    return query.offset(skip).limit(limit).all()


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    return client


@router.post("/", response_model=ClientResponse)
async def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    db_client = Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(client_id: str, client_update: ClientUpdate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    for key, value in client_update.model_dump(exclude_unset=True).items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}")
async def delete_client(client_id: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    db.delete(client)
    db.commit()
    return {"message": "Client supprimé"}
