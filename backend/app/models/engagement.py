"""
Modèle SQLAlchemy pour les engagements (crédits)

Ce fichier définit le modèle de données pour les engagements de crédit.
Les engagements sont liés aux clients et ont un type de crédit, un montant, une durée, etc.

TODO : Implémenter le modèle Engagement
- Définir les colonnes de la table engagements
- Définir les relations avec clients
- Définir les contraintes (unique, not null, etc.)
- Définir les méthodes utilitaires (calculer mensualité, etc.)

Pourquoi ce modèle ?
- Stocke les engagements de crédit
- Gère les types de crédit (Mourabaha, Ijara, etc.)
- Gère les scores de risque par engagement
- Intègre avec RLS (Row Level Security)
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class CreditType(enum.Enum):
    MOURABAHA_IMMO = "Mourabaha Immo"
    IJARA = "Ijara"
    MOURABAHA_AUTO = "Mourabaha Auto"
    CREDIT_TRESO = "Crédit Tréso"
    INVESTISSEMENT_PME = "Investissement PME"


class EngagementStatus(enum.Enum):
    EN_ANALYSE = "En analyse"
    VALIDE = "Validé"
    DEBLOQUE = "Débloqué"
    SURVEILLANCE = "Surveillance"
    CONTENTIEUX = "Contentieux"


class Engagement(Base):
    __tablename__ = "engagements"

    ref = Column(String(50), primary_key=True, index=True)
    client_id = Column(String(50), ForeignKey("clients.id"), nullable=False)
    client_nom = Column(String(100), nullable=False)
    type_credit = Column(SQLEnum(CreditType), nullable=False)
    montant = Column(Float, nullable=False)
    duree = Column(Integer, nullable=False)
    taux = Column(Float, nullable=False)
    score = Column(Integer, nullable=False)
    statut = Column(SQLEnum(EngagementStatus), default=EngagementStatus.EN_ANALYSE)
    date_depot = Column(DateTime(timezone=True), server_default=func.now())
    agence_id = Column(String(50), ForeignKey("agences.id"), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    client = relationship("Client", back_populates="engagements")
    agence = relationship("Agence", back_populates="engagements")
