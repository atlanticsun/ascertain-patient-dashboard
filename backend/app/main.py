"""FastAPI application entry point."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, inspect, select

from app import models  # noqa: F401  (register models on Base.metadata)
from app.database import SessionLocal, engine
from app.middleware import AccessLogMiddleware
from app.routers import patients

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Seed the database on startup when the patients table exists but is empty.

    Migrations own the schema, so this only fills data and never creates tables.
    """
    from seed import seed_database

    db = SessionLocal()
    try:
        tables = inspect(engine).get_table_names()
        if "patients" in tables:
            count = db.scalar(select(func.count()).select_from(models.Patient)) or 0
            if count == 0:
                seed_database(db)
                logger.info("Seeded the database with sample patients")
    except Exception:
        logger.exception("Startup seed check failed, continuing without seeding")
    finally:
        db.close()
    yield


app = FastAPI(title="Patient Dashboard API", lifespan=lifespan)

app.add_middleware(AccessLogMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(patients.router)


@app.get("/health")
def health():
    """Health check used by docker compose and uptime monitors."""
    return {"status": "ok"}
