"""
Modèle SQLAlchemy pour les utilisateurs

Ce fichier définit le modèle de données pour les utilisateurs de l'application.
Les utilisateurs ont des rôles (DG, DR, CA, AR, Admin) et sont authentifiés via OAuth 2.0 + PKCE.

TODO : Implémenter le modèle User
- Définir les colonnes de la table users
- Définir les relations avec d'autres modèles (si nécessaire)
- Définir les contraintes (unique, not null, etc.)
- Définir les méthodes utilitaires (hash password, verify password, etc.)

Pourquoi ce modèle ?
- Stocke les utilisateurs de l'application
- Gère les rôles et permissions
- Intègre avec OAuth 2.0 + PKCE
- Intègre avec RLS (Row Level Security)
"""

import enum

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.sql import func

from app.database import Base


class UserRole(enum.Enum):
    DG = "DG"
    DR = "DR"
    CA = "CA"
    AR = "AR"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    nom = Column(String(100), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    hashed_password = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
