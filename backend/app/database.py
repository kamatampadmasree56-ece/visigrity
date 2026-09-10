import os
import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger("visigrity.database")

def get_database_url() -> str:
    url = settings.DATABASE_URL
    # Normalize postgres:// to postgresql:// (for Neon/Supabase/Render/Heroku DB URLs)
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    
    # Normalize postgresql+psycopg:// to postgresql:// if psycopg2 is used
    if url.startswith("postgresql+psycopg://"):
        url = url.replace("postgresql+psycopg://", "postgresql://", 1)
    
    # On serverless (Vercel Lambda) the current working directory /var/task is read-only.
    # If SQLite relative path is used, automatically store in writable /tmp.
    if ("sqlite" in url and ("./" in url or not url.startswith("sqlite:////"))) and os.path.exists("/tmp") and os.access("/tmp", os.W_OK):
        url = "sqlite:////tmp/visigrity.db"
    return url

database_url = get_database_url()

connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        database_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        echo=False,
        future=True,
    )
except Exception as e:
    logger.warning(f"Failed to initialize primary database at {database_url}: {e}. Falling back to SQLite.")
    fallback_url = "sqlite:////tmp/visigrity.db" if (os.path.exists("/tmp") and os.access("/tmp", os.W_OK)) else "sqlite:///./visigrity.db"
    database_url = fallback_url
    engine = create_engine(
        fallback_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
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
