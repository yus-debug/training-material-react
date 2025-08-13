"""
Configuration settings for the FastAPI application.
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    database_url: str = "sqlite:///./inventory.db"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    # CORS settings for React frontend
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3040",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3040",
    ]
    
    class Config:
        env_file = ".env"


settings = Settings()
