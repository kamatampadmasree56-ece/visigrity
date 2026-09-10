import os
import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger(__name__)

# Determine engine parameters based on database type
database_url = settings.DATABASE_URL

connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        database_url,
        connect_args=connect_args,
        echo=False,
        future=True,
    )
except Exception as e:
    logger.warning(f"Failed to initialize primary database at {database_url}: {e}. Falling back to SQLite.")
    database_url = "sqlite:///./visigrity.db"
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
        echo=False,
        future=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
