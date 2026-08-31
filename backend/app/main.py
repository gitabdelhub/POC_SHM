from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from loguru import logger

from app.config import settings
from app.database import engine, init_db
from app.routers import agences, ai, auth, clients, engagements, etl, gold
from app.scheduler import start_scheduler, stop_scheduler

app = FastAPI(
    title="Saham Bank Analytics Portal API",
    description="API pour le portail analytique Saham Bank",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

try:
    logger.add(
        settings.LOG_FILE,
        rotation="500 MB",
        retention="10 days",
        level=settings.LOG_LEVEL
    )
except Exception:
    pass


@app.on_event("startup")
async def startup_event():
    logger.info("Démarrage de l'application Saham Bank API")
    try:
        init_db()
    except Exception as e:
        logger.warning(f"init_db bypass: {e}")
    try:
        if settings.ETL_SCHEDULER_ENABLED:
            start_scheduler()
    except Exception as e:
        logger.warning(f"scheduler bypass: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Arrêt de l'application")
    try:
        stop_scheduler()
    except Exception:
        pass
    try:
        engine.dispose()
    except Exception:
        pass


@app.get("/")
async def root():
    return {"message": "Saham Bank Analytics Portal API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


app.include_router(auth.router, prefix="/auth", tags=["Authentification"])
app.include_router(clients.router, prefix="/clients", tags=["Clients"])
app.include_router(engagements.router, prefix="/engagements", tags=["Engagements"])
app.include_router(agences.router, prefix="/agences", tags=["Agences"])
app.include_router(gold.router, prefix="/gold", tags=["Gold Warehouse"])
app.include_router(etl.router, tags=["ETL"])
app.include_router(ai.router, tags=["SahamAI"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
