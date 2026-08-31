"""
Modèle SQLAlchemy pour les agences

Ce fichier définit le modèle de données pour les agences bancaires.
Les agences sont situées dans des villes et régions et ont des clients et engagements.

TODO : Implémenter le modèle Agence
- Définir les colonnes de la table agences
- Définir les relations avec clients et engagements
- Définir les contraintes (unique, not null, etc.)
- Définir les méthodes utilitaires (calculer KPIs, etc.)

Pourquoi ce modèle ?
- Stocke les agences de la banque
- Gère les localisations (ville, région)
- Gère les KPIs par agence
- Intègre avec RLS (Row Level Security)
"""

from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Agence(Base):
    __tablename__ = "agences"

    id = Column(String(50), primary_key=True, index=True)
    nom = Column(String(100), nullable=False, unique=True)
    ville = Column(String(50), nullable=False)
    region = Column(String(50), nullable=False)
    directeur = Column(String(100), nullable=True)
    telephone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    nombre_clients = Column(Integer, default=0)
    encours_total = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    clients = relationship("Client", back_populates="agence")
    engagements = relationship("Engagement", back_populates="agence")
