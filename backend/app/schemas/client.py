"""
Schemas Pydantic pour les clients

Ce fichier définit les schemas Pydantic pour la validation des données clients.
Les schemas sont utilisés pour la validation des requêtes et réponses API.

TODO : Implémenter les schemas Pydantic pour les clients
- Schema pour la création de client
- Schema pour la réponse client
- Schema pour la mise à jour de client

Pourquoi ces schemas ?
- Validation automatique des données
- Documentation automatique (Swagger UI)
- Type safety
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from app.models.client import ClientSegment, ClientStatus


class ClientBase(BaseModel):
    """Base schema pour les clients"""
    nom: str = Field(..., min_length=1, max_length=100)
    segment: ClientSegment
    agence_id: str = Field(..., min_length=1)
    email: Optional[str] = Field(None, max_length=100)
    telephone: Optional[str] = Field(None, max_length=20)


class ClientCreate(ClientBase):
    """Schema pour la création de client"""
    encours: float = Field(0.0, ge=0)
    score: int = Field(..., ge=0, le=100)
    statut: ClientStatus = ClientStatus.ACTIF


class ClientResponse(ClientBase):
    """Schema pour la réponse client"""
    id: str
    encours: float
    score: int
    statut: ClientStatus
    date_creation: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ClientUpdate(BaseModel):
    """Schema pour la mise à jour de client"""
    nom: Optional[str] = Field(None, min_length=1, max_length=100)
    segment: Optional[ClientSegment] = None
    agence_id: Optional[str] = Field(None, min_length=1)
    encours: Optional[float] = Field(None, ge=0)
    score: Optional[int] = Field(None, ge=0, le=100)
    statut: Optional[ClientStatus] = None
    email: Optional[str] = Field(None, max_length=100)
    telephone: Optional[str] = Field(None, max_length=20)
