"""
Configuration de l'application FastAPI
Ce fichier configure les paramètres de l'application, notamment
 les variables d'environnement et les paramètres OAuth 2.0 + PKCE.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    POSTGRES_HOST: str = Field("localhost", env="POSTGRES_HOST")
    POSTGRES_PORT: int = Field(5432, env="POSTGRES_PORT")
    POSTGRES_DB: str = Field("saham_bank", env="POSTGRES_DB")
    POSTGRES_USER: str = Field("postgres", env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field(..., env="POSTGRES_PASSWORD")
    
    # OAuth 2.0 + PKCE
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    OAUTH_CLIENT_ID: str = Field(..., env="OAUTH_CLIENT_ID")
    OAUTH_CLIENT_SECRET: str = Field(..., env="OAUTH_CLIENT_SECRET")
    OAUTH_REDIRECT_URI: str = Field(..., env="OAUTH_REDIRECT_URI")
    
    # Logging
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")
    LOG_FILE: str = Field("app.log", env="LOG_FILE")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(60, env="RATE_LIMIT_PER_MINUTE")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# TODO : Ajouter des fonctions utilitaires si nécessaire
# Exemple : get_database_url(), get_oauth_config(), etc.


