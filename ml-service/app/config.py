from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from typing import Optional
import os

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    SERVICE_NAME: str = "varshasetu-ml-service"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("NODE_ENV", os.getenv("ENVIRONMENT", "development"))
    PORT: int = int(os.getenv("PORT", os.getenv("ML_SERVICE_PORT", "8000")))
    CORS_ORIGIN: str = os.getenv("CORS_ORIGIN", "http://localhost:5173,http://localhost:5001")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:5001")
    
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

    # Safe Feature Flags (All default to false; offline empirical archive fallback preserved)
    ENABLE_EXTERNAL_WEATHER: bool = False
    ENABLE_CDS_DATA: bool = False
    ENABLE_SATELLITE_DATA: bool = False
    ENABLE_BHASHINI: bool = False
    ENABLE_EXTERNAL_VOICE: bool = False

    # Weather / Meteorological Placeholders - Optional
    OPENWEATHER_API_KEY: Optional[str] = None
    WEATHERAPI_KEY: Optional[str] = None
    TOMORROW_IO_API_KEY: Optional[str] = None
    METEOMATICS_USERNAME: Optional[str] = None
    METEOMATICS_PASSWORD: Optional[str] = None

    # Climate / Reanalysis Placeholders - Optional
    CDS_API_URL: str = "https://cds.climate.copernicus.eu/api"
    CDS_API_KEY: Optional[str] = None
    NASA_EARTHDATA_USERNAME: Optional[str] = None
    NASA_EARTHDATA_PASSWORD: Optional[str] = None
    NASA_EARTHDATA_TOKEN: Optional[str] = None

    # Satellite / Remote Sensing Placeholders - Optional
    SENTINEL_HUB_CLIENT_ID: Optional[str] = None
    SENTINEL_HUB_CLIENT_SECRET: Optional[str] = None
    GOOGLE_EARTH_ENGINE_PROJECT: Optional[str] = None
    GOOGLE_EARTH_ENGINE_SERVICE_ACCOUNT: Optional[str] = None
    GOOGLE_EARTH_ENGINE_PRIVATE_KEY: Optional[str] = None

    # Government / Indian Language Services (Bhashini) - Optional
    BHASHINI_API_BASE_URL: Optional[str] = None
    BHASHINI_API_KEY: Optional[str] = None
    BHASHINI_USER_ID: Optional[str] = None
    BHASHINI_PIPELINE_ID: Optional[str] = None

    # Observability Placeholders - Optional
    SENTRY_DSN: Optional[str] = None
    OTEL_EXPORTER_OTLP_ENDPOINT: Optional[str] = None
    OTEL_SERVICE_NAME: str = "varshasetu-ml"

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()

# Ensure storage directories exist
settings.RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.FEATURE_DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
settings.METRICS_DIR.mkdir(parents=True, exist_ok=True)
settings.EXPERIMENTS_DIR.mkdir(parents=True, exist_ok=True)
