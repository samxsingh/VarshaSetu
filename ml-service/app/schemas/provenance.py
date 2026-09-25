from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ProvenanceMetadata(BaseModel):
    provider: str
    dataset_name: str
    variable: str
    source_url: str
    retrieval_timestamp: datetime = Field(default_factory=datetime.utcnow)
    coverage_start: Optional[str] = None
    coverage_end: Optional[str] = None
    spatial_resolution: Optional[str] = None
    temporal_resolution: Optional[str] = None
    native_units: str
    target_units: str
    license_info: Optional[str] = None
    processing_version: str = "1.0.0"
    quality_status: str = "GOOD"
