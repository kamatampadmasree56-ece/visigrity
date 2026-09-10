import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    API_PREFIX: str = "/api"
    PROJECT_NAME: str = "VISIGRITY"
    TAGLINE: str = "Integrity Behind Every Vision."
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "sqlite:///./visigrity.db"
    SQLITE_FALLBACK: bool = True
    
    # Security & JWT
    JWT_SECRET_KEY: str = "visigrity-super-secret-jwt-key-for-local-demo-and-testing-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    
    # Platform modes
    BLOCKCHAIN_MODE: str = "DEMO"
    CV_ENGINE_MODE: str = "DEMO"

    @property
    def cors_origins_list(self) -> List[str]:
        origins = []
        for origin in self.CORS_ORIGINS.split(","):
            cleaned = origin.strip().rstrip("/")
            if cleaned and cleaned != "*":
                origins.append(cleaned)
            elif cleaned == "*":
                # Wildcard with credentials is prohibited by CORS spec
                origins.append("*")
        return origins if origins else ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
