"""
Modèle SQLAlchemy pour les clients

Ce fichier définit le modèle de données pour les clients bancaires.
Les clients sont liés à des agences et ont des engagements (crédits).

TODO : Implémenter le modèle Client
- Définir les colonnes de la table clients
- Définir les relations avec agences et engagements
- Définir les contraintes (unique, not null, etc.)
- Définir les méthodes utilitaires (calculer score, etc.)

Pourquoi ce modèle ?
- Stocke les clients de la banque
- Gère les segments (Particuliers, PME, etc.)
- Gère les scores de risque
- Intègre avec RLS (Row Level Security)
"""

import enum

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ClientSegment(enum.Enum):
    PARTICULIERS = "Particuliers"
    PROFESSIONNELS = "Professionnels"
    PME = "PME"
    GRANDES_ENTREPRISES = "Grandes Entreprises"
    BANCASSURANCE = "Bancassurance"


class ClientStatus(enum.Enum):
    ACTIF = "Actif"
    A_RISQUE = "À risque"
    DEFAUT = "Défaut"


class Client(Base):
    __tablename__ = "clients"

    id = Column(String(50), primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    segment = Column(SQLEnum(ClientSegment), nullable=False)
    agence_id = Column(String(50), ForeignKey("agences.id"), nullable=False)
    encours = Column(Float, default=0.0)
    score = Column(Integer, nullable=False)
    statut = Column(SQLEnum(ClientStatus), default=ClientStatus.ACTIF)
    email = Column(String(100), nullable=True)
    telephone = Column(String(20), nullable=True)
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    agence = relationship("Agence", back_populates="clients")
    engagements = relationship("Engagement", back_populates="client")
