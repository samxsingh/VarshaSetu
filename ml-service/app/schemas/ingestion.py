from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

class IngestionStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"

class DataFreshness(str, Enum):
    FRESH = "FRESH"
    AGING = "AGING"
    STALE = "STALE"
    UNKNOWN = "UNKNOWN"

class QualityFlag(str, Enum):
    GOOD = "GOOD"
    WARNING = "WARNING"
    BAD = "BAD"
    MISSING = "MISSING"
    IMPUTED = "IMPUTED"

class QualityReport(BaseModel):
    dataset_name: str
    total_records: int
    valid_records: int
    missing_records: int
    outlier_records: int
    quality_score: float = Field(..., ge=0.0, le=1.0)
    quality_flag: QualityFlag
    details: Dict[str, Any] = Field(default_factory=dict)
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)

class IngestionRunResult(BaseModel):
    id: Optional[str] = None
    source_name: str
    provider: str
    dataset_name: str
    variable: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: IngestionStatus
    records_processed: int = 0
    records_failed: int = 0
    quality_summary: Optional[QualityReport] = None
    processing_version: str = "1.0.0"
    file_path: Optional[str] = None
    error_message: Optional[str] = None
