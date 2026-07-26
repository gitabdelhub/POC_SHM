"""
Schemas Pydantic pour les utilisateurs

Ce fichier définit les schemas Pydantic pour la validation des données utilisateurs.
Les schemas sont utilisés pour la validation des requêtes et réponses API.

TODO : Implémenter les schemas Pydantic pour les utilisateurs
- Schema pour la création d'utilisateur
- Schema pour la réponse utilisateur
- Schema pour la mise à jour d'utilisateur
- Schema pour le login

Pourquoi ces schemas ?
- Validation automatique des données
- Documentation automatique (Swagger UI)
- Type safety
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    """Base schema pour les utilisateurs"""
    email: EmailStr
    nom: str = Field(..., min_length=1, max_length=100)
    role: UserRole


class UserCreate(UserBase):
    """Schema pour la création d'utilisateur"""
    password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    """Schema pour la réponse utilisateur"""
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema pour la mise à jour d'utilisateur"""
    email: Optional[EmailStr] = None
    nom: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserLogin(BaseModel):
    """Schema pour le login"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema pour la réponse token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # En secondes
