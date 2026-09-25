from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    SERVICE_NAME: str = "varshasetu-ml-service"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("NODE_ENV", "development")
    PORT: int = int(os.getenv("ML_SERVICE_PORT", "8000"))
    
    # PostgreSQL Connection (matches backend)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://localhost:5432/varshasetu")
    
    # Storage paths
    DATA_DIR: Path = BASE_DIR / "data"
    RAW_DATA_DIR: Path = BASE_DIR / "data" / "raw"
    PROCESSED_DATA_DIR: Path = BASE_DIR / "data" / "processed"
    FEATURE_DATA_DIR: Path = BASE_DIR / "data" / "features"
    
    # ML Artifacts paths
    ARTIFACTS_DIR: Path = BASE_DIR / "artifacts"
    MODELS_DIR: Path = BASE_DIR / "artifacts" / "models"
    METRICS_DIR: Path = BASE_DIR / "artifacts" / "metrics"
    EXPERIMENTS_DIR: Path = BASE_DIR / "artifacts" / "experiments"
    
    # Scientific Feature Calculation Thresholds
    DRY_DAY_THRESHOLD_MM: float = 1.0  # Configurable: Daily rainfall < 1.0 mm is a dry day
    HEAVY_RAIN_THRESHOLD_MM: float = 64.5  # IMD Heavy rainfall threshold: >= 64.5 mm / 24h
    EXTREME_RAIN_THRESHOLD_MM: float = 115.5  # IMD Very Heavy rainfall threshold: >= 115.5 mm / 24h
    
    # Lucknow Demonstration Reference Coordinates
    DEFAULT_LATITUDE: float = 26.9749
    DEFAULT_LONGITUDE: float = 80.9276

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()

# Ensure storage directories exist
settings.RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.FEATURE_DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
settings.METRICS_DIR.mkdir(parents=True, exist_ok=True)
settings.EXPERIMENTS_DIR.mkdir(parents=True, exist_ok=True)
