"""
Schemas Pydantic pour les agences

Ce fichier définit les schemas Pydantic pour la validation des données agences.
Les schemas sont utilisés pour la validation des requêtes et réponses API.

TODO : Implémenter les schemas Pydantic pour les agences
- Schema pour la création d'agence
- Schema pour la réponse agence
- Schema pour la mise à jour d'agence

Pourquoi ces schemas ?
- Validation automatique des données
- Documentation automatique (Swagger UI)
- Type safety
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class AgenceBase(BaseModel):
    """Base schema pour les agences"""
    nom: str = Field(..., min_length=1, max_length=100)
    ville: str = Field(..., min_length=1, max_length=50)
    region: str = Field(..., min_length=1, max_length=50)
    directeur: Optional[str] = Field(None, max_length=100)
    telephone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None


class AgenceCreate(AgenceBase):
    """Schema pour la création d'agence"""
    pass


class AgenceResponse(AgenceBase):
    """Schema pour la réponse agence"""
    id: str
    nombre_clients: int
    encours_total: float
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class AgenceUpdate(BaseModel):
    """Schema pour la mise à jour d'agence"""
    nom: Optional[str] = Field(None, min_length=1, max_length=100)
    ville: Optional[str] = Field(None, min_length=1, max_length=50)
    region: Optional[str] = Field(None, min_length=1, max_length=50)
    directeur: Optional[str] = Field(None, max_length=100)
    telephone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    nombre_clients: Optional[int] = Field(None, ge=0)
    encours_total: Optional[float] = Field(None, ge=0)
