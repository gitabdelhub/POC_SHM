"""
Schemas Pydantic pour les engagements

Ce fichier définit les schemas Pydantic pour la validation des données engagements.
Les schemas sont utilisés pour la validation des requêtes et réponses API.

TODO : Implémenter les schemas Pydantic pour les engagements
- Schema pour la création d'engagement
- Schema pour la réponse engagement
- Schema pour la mise à jour d'engagement

Pourquoi ces schemas ?
- Validation automatique des données
- Documentation automatique (Swagger UI)
- Type safety
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.engagement import CreditType, EngagementStatus


class EngagementBase(BaseModel):
    client_id: str = Field(..., min_length=1)
    client_nom: str = Field(..., min_length=1, max_length=100)
    type_credit: CreditType
    montant: float = Field(..., gt=0)
    duree: int = Field(..., gt=0)
    taux: float = Field(..., gt=0)
    agence_id: str = Field(..., min_length=1)


class EngagementCreate(EngagementBase):
    score: int = Field(..., ge=0, le=100)
    statut: EngagementStatus = EngagementStatus.EN_ANALYSE


class EngagementResponse(EngagementBase):
    ref: str
    score: int
    statut: EngagementStatus
    date_depot: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class EngagementUpdate(BaseModel):
    client_id: Optional[str] = Field(None, min_length=1)
    client_nom: Optional[str] = Field(None, min_length=1, max_length=100)
    type_credit: Optional[CreditType] = None
    montant: Optional[float] = Field(None, gt=0)
    duree: Optional[int] = Field(None, gt=0)
    taux: Optional[float] = Field(None, gt=0)
    score: Optional[int] = Field(None, ge=0, le=100)
    statut: Optional[EngagementStatus] = None
    agence_id: Optional[str] = Field(None, min_length=1)
