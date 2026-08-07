"""
Configuration de l'application FastAPI
Ce fichier configure les paramètres de l'application, notamment
 les variables d'environnement et les paramètres OAuth 2.0 + PKCE.
"""

from pydantic import Field
from pydantic_settings import BaseSettings


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

    # CORS (origines autorisées, séparées par des virgules)
    CORS_ORIGINS: str = Field("http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000", env="CORS_ORIGINS")

    # RAG / Chatbot IA
    LLM_PROVIDER: str = Field("groq", env="LLM_PROVIDER")          # "groq" | "ollama" | "mock"
    GROQ_API_KEY: str = Field("", env="GROQ_API_KEY")
    GROQ_MODEL: str = Field("llama-3.3-70b-versatile", env="GROQ_MODEL")
    OLLAMA_BASE_URL: str = Field("http://localhost:11434", env="OLLAMA_BASE_URL")
    OLLAMA_MODEL: str = Field("llama3.2:3b", env="OLLAMA_MODEL")
    EMBEDDING_MODEL: str = Field(
        "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        env="EMBEDDING_MODEL",
    )
    EMBEDDING_DIM: int = Field(384, env="EMBEDDING_DIM")
    AI_TOP_K: int = Field(4, env="AI_TOP_K")                       # nb de chunks pertinents
    SQL_MAX_ROWS: int = Field(100, env="SQL_MAX_ROWS")             # LIMIT max appliquee

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# TODO : Ajouter des fonctions utilitaires si nécessaire
# Exemple : get_database_url(), get_oauth_config(), etc.


