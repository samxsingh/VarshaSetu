from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
import httpx
import time
from pathlib import Path
import pandas as pd
from ..schemas.provenance import ProvenanceMetadata
from ..schemas.ingestion import QualityReport
from ..config import settings

class BaseProvider(ABC):
    def __init__(self, name: str, provider_id: str):
        self.name = name
        self.provider_id = provider_id

    @abstractmethod
    async def fetch(self, **kwargs) -> Any:
        """Fetch raw observations or indices from external provider."""
        pass

    @abstractmethod
    def validate(self, raw_data: Any) -> QualityReport:
        """Run automated quality checks, anomaly detection, and return QualityReport."""
        pass

    @abstractmethod
    def normalize(self, raw_data: Any) -> pd.DataFrame:
        """Standardize units, temporal indexes (UTC), and column naming."""
        pass

    @abstractmethod
    def get_metadata(self) -> ProvenanceMetadata:
        """Return scientific provenance metadata including source, resolution, and licensing."""
        pass

    def save_raw(self, filename: str, content: str | bytes) -> Path:
        """Save raw payload to disk for auditability."""
        file_path = settings.RAW_DATA_DIR / f"{self.provider_id}_{filename}"
        if isinstance(content, str):
            file_path.write_text(content, encoding="utf-8")
        else:
            file_path.write_bytes(content)
        return file_path

    async def _http_get_with_retry(
        self,
        url: str,
        max_retries: int = 3,
        timeout_seconds: float = 15.0,
        headers: Optional[Dict[str, str]] = None
    ) -> httpx.Response:
        """Execute bounded HTTP GET with exponential backoff."""
        client_headers = {
            "User-Agent": "VarshaSetu-Scientific-Ingestion/1.0 (Agromet Decision Support; Research & Humanitarian Pilot)",
            **(headers or {})
        }
        
        async with httpx.AsyncClient(timeout=timeout_seconds, follow_redirects=True) as client:
            for attempt in range(1, max_retries + 1):
                try:
                    response = await client.get(url, headers=client_headers)
                    response.raise_for_status()
                    return response
                except (httpx.RequestError, httpx.HTTPStatusError) as exc:
                    if attempt == max_retries:
                        raise RuntimeError(f"Provider {self.name} fetch failed after {max_retries} attempts: {exc}")
                    sleep_time = 2 ** attempt
                    time.sleep(sleep_time)
        raise RuntimeError(f"Unexpected termination fetching from {self.name}")
