import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "QueueSense API"
    # Use SQLite by default for easy testing, but support PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./queue_sense.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key")
    ALGORITHM: str = "HS256"
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

settings = Settings()
