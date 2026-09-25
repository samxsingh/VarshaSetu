import json
from datetime import datetime, date
from typing import Optional, Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd

from ..providers.noaa_enso import NoaaEnsoProvider
from ..providers.bom_iod import BomIodProvider
from ..providers.bom_mjo import BomMjoProvider
from ..providers.openmeteo_weather import OpenMeteoWeatherProvider
from ..validation.quality_control import QualityController
from ..processing.derived_features import DerivedFeatureCalculator
from ..processing.spatial_join import AdministrativeSpatialAligner
from ..storage.dataset_store import DatasetStore
from ..schemas.ingestion import IngestionStatus, IngestionRunResult, QualityReport
from ..schemas.provenance import ProvenanceMetadata
from ..config import settings

class IngestionPipeline:
    @staticmethod
    def _log_run_to_db(
        provider: str,
        dataset_name: str,
        variable: str,
        started_at: datetime,
        completed_at: datetime,
        status: IngestionStatus,
        records_processed: int,
        records_failed: int,
        quality_report: Optional[QualityReport],
        file_path: Optional[str],
        error_message: Optional[str] = None
    ) -> Optional[str]:
        """Record pipeline execution in PostgreSQL data_ingestion_runs and data_quality_reports."""
        try:
            conn = psycopg2.connect(settings.DATABASE_URL)
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Insert into data_ingestion_runs
            quality_json = json.dumps(quality_report.model_dump(mode="json")) if quality_report else "{}"
            cur.execute("""
                INSERT INTO data_ingestion_runs (
                    source_name, provider, dataset_name, variable, started_at, completed_at,
                    status, records_processed, records_failed, quality_summary, file_path, error_message
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id;
            """, (
                f"{provider} {dataset_name}", provider, dataset_name, variable, started_at, completed_at,
                status.value, records_processed, records_failed, quality_json, file_path, error_message
            ))
            run_id = cur.fetchone()["id"]

            # Insert into data_quality_reports
            if quality_report:
                cur.execute("""
                    INSERT INTO data_quality_reports (
                        run_id, dataset_name, total_records, valid_records, missing_records,
                        outlier_records, quality_score, quality_flag, details
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (
                    run_id, dataset_name, quality_report.total_records, quality_report.valid_records,
                    quality_report.missing_records, quality_report.outlier_records, quality_report.quality_score,
                    quality_report.quality_flag.value, json.dumps(quality_report.details)
                ))

            # Update data_sources table status to FRESH
            cur.execute("""
                UPDATE data_sources
                SET status = 'FRESH',
                    last_successful_sync = NOW()
                WHERE provider = %s;
            """, (provider,))

            conn.commit()
            cur.close()
            conn.close()
            return str(run_id)
        except Exception as exc:
            # Standalone or network test fallback
            print(f"ℹ️ Database run logging skipped or failed: {exc}")
            return None

    @classmethod
    async def run_enso_pipeline(cls) -> IngestionRunResult:
        started_at = datetime.utcnow()
        provider = NoaaEnsoProvider()
        try:
            raw = await provider.fetch()
            qc_initial = provider.validate(raw)
            df = provider.normalize(raw)
            df_clean, qc_report = QualityController.audit_dataframe(df, "NOAA_CPC_NINO34")

            meta = provider.get_metadata()
            saved_path = DatasetStore.save_processed("climate_enso_nino34", df_clean, meta)

            completed_at = datetime.utcnow()
            run_id = cls._log_run_to_db(
                provider.provider_id, "Niño 3.4 SST Anomaly", "ENSO_SST",
                started_at, completed_at, IngestionStatus.SUCCESS,
                len(df_clean), qc_report.missing_records, qc_report, str(saved_path)
            )

            return IngestionRunResult(
                id=run_id,
                source_name=provider.name,
                provider=provider.provider_id,
                dataset_name="Niño 3.4 SST Anomaly Index",
                variable="ENSO_SST",
                started_at=started_at,
                completed_at=completed_at,
                status=IngestionStatus.SUCCESS,
                records_processed=len(df_clean),
                records_failed=qc_report.missing_records,
                quality_summary=qc_report,
                file_path=str(saved_path)
            )
        except Exception as exc:
            completed_at = datetime.utcnow()
            return IngestionRunResult(
                source_name=provider.name,
                provider=provider.provider_id,
                dataset_name="Niño 3.4 SST Anomaly Index",
                variable="ENSO_SST",
                started_at=started_at,
                completed_at=completed_at,
                status=IngestionStatus.FAILED,
                error_message=str(exc)
            )

    @classmethod
    async def run_iod_pipeline(cls) -> IngestionRunResult:
        started_at = datetime.utcnow()
        provider = BomIodProvider()
        try:
            raw = await provider.fetch()
            df = provider.normalize(raw)
            df_clean, qc_report = QualityController.audit_dataframe(df, "BOM_IOD_DMI")

            meta = provider.get_metadata()
            saved_path = DatasetStore.save_processed("climate_iod_dmi", df_clean, meta)

            completed_at = datetime.utcnow()
            run_id = cls._log_run_to_db(
                provider.provider_id, "Dipole Mode Index", "IOD_DMI",
                started_at, completed_at, IngestionStatus.SUCCESS,
                len(df_clean), qc_report.missing_records, qc_report, str(saved_path)
            )

            return IngestionRunResult(
                id=run_id,
                source_name=provider.name,
                provider=provider.provider_id,
                dataset_name="Dipole Mode Index (IOD DMI)",
                variable="IOD_DMI",
                started_at=started_at,
                completed_at=completed_at,
                status=IngestionStatus.SUCCESS,
                records_processed=len(df_clean),
                records_failed=qc_report.missing_records,
                quality_summary=qc_report,
                file_path=str(saved_path)
            )
        except Exception as exc:
            completed_at = datetime.utcnow()
            return IngestionRunResult(
                source_name=provider.name,
                provider=provider.provider_id,
                dataset_name="Dipole Mode Index (IOD DMI)",
                variable="IOD_DMI",
                started_at=started_at,
                completed_at=completed_at,
                status=IngestionStatus.FAILED,
                error_message=str(exc)
            )

    @classmethod
    async def run_mjo_pipeline(cls) -> IngestionRunResult:
        started_at = datetime.utcnow()
        provider = BomMjoProvider()
        try:
            raw = await provider.fetch()
            df = provider.normalize(raw)
            df_clean, qc_report = QualityController.audit_dataframe(df, "BOM_MJO_RMM")

            meta = provider.get_metadata()
            saved_path = DatasetStore.save_processed("climate_mjo_rmm", df_clean, meta)

            completed_at = datetime.utcnow()
            run_id = cls._log_run_to_db(
                provider.provider_id, "MJO RMM1/RMM2 Index", "MJO_RMM",
                started_at, completed_at, IngestionStatus.SUCCESS,
                len(df_clean), qc_report.missing_records, qc_report, str(saved_path)
            )

            return IngestionRunResult(
                id=run_id,
                source_name=provider.name,
                provider=provider.provider_id,
                dataset_name="Real-time Multivariate MJO Index",
                variable="MJO_RMM",
                started_at=started_at,
                completed_at=completed_at,
                status=IngestionStatus.SUCCESS,
                records_processed=len(df_clean),
                records_failed=qc_report.missing_records,
                quality_summary=qc_report,
                file_path=str(saved_path)
            )
        except Exception as exc:
            completed_at = datetime.utcnow()
            return IngestionRunResult(
                source_name=provider.name,
                provider=provider.provider_id,
                dataset_name="Real-time Multivariate MJO Index",
                variable="MJO_RMM",
                started_at=started_at,
                completed_at=completed_at,
                status=IngestionStatus.FAILED,
                error_message=str(exc)
            )

    @classmethod
    async def run_weather_and_features_pipeline(
        cls,
        start_date: str = "2024-06-01",
        end_date: str = "2024-09-30"
    ) -> IngestionRunResult:
        started_at = datetime.utcnow()
        provider = OpenMeteoWeatherProvider(lat=settings.DEFAULT_LATITUDE, lon=settings.DEFAULT_LONGITUDE)
        try:
            raw = await provider.fetch(start_date=start_date, end_date=end_date)
            df = provider.normalize(raw)
            df_clean, qc_report = QualityController.audit_dataframe(df, "OPEN_METEO_ERA5_WEATHER")

            # 1. Spatial join to Lucknow administrative block
            df_aligned = AdministrativeSpatialAligner.align_weather_to_blocks(df_clean)

            # 2. Derive rolling monsoon features and spell metrics
            df_features = DerivedFeatureCalculator.compute_all_monsoon_features(df_aligned)

            # 3. Store normalized observations
            meta_obs = provider.get_metadata()
            saved_obs_path = DatasetStore.save_processed("weather_lucknow_observations", df_clean, meta_obs)

            # 4. Store ML-ready derived features dataset
            meta_features = ProvenanceMetadata(
                provider="VarshaSetu-Downscaling-Pipeline",
                dataset_name="Lucknow Block Derived Monsoon Feature Matrix",
                variable="DERIVED_AGROMET_FEATURES",
                source_url=f"ERA5-Land via Open-Meteo ({provider.BASE_URL})",
                native_units="mm, °C, days, %",
                target_units="SI Agromet standard",
                temporal_resolution="DAILY",
                spatial_resolution="Block Centroid (UP_LKO_BKT, 26.9749°N, 80.9276°E)",
                license_info="Derived from Open Access ERA5-Land",
                quality_status="GOOD"
            )
            saved_features_path = DatasetStore.save_features("features_lucknow_monsoon_matrix", df_features, meta_features)

            completed_at = datetime.utcnow()
            run_id = cls._log_run_to_db(
                provider.provider_id, "Daily Weather Observations & Features", "PRECIP_TEMP_PRESSURE",
                started_at, completed_at, IngestionStatus.SUCCESS,
                len(df_features), qc_report.missing_records, qc_report, str(saved_features_path)
            )

            return IngestionRunResult(
                id=run_id,
                source_name=provider.name,
                provider=provider.provider_id,
                dataset_name="Daily Weather Observations & Features",
                variable="PRECIP_TEMP_PRESSURE",
                started_at=started_at,
                completed_at=completed_at,
                status=IngestionStatus.SUCCESS,
                records_processed=len(df_features),
                records_failed=qc_report.missing_records,
                quality_summary=qc_report,
                file_path=str(saved_features_path)
            )
        except Exception as exc:
            completed_at = datetime.utcnow()
            return IngestionRunResult(
                source_name=provider.name,
                provider=provider.provider_id,
                dataset_name="Daily Weather Observations & Features",
                variable="PRECIP_TEMP_PRESSURE",
                started_at=started_at,
                completed_at=completed_at,
                status=IngestionStatus.FAILED,
                error_message=str(exc)
            )

    @classmethod
    async def run_all_pipelines(cls) -> List[IngestionRunResult]:
        """Execute complete ingestion sequence across ENSO, IOD, MJO, and Weather."""
        results = []
        results.append(await cls.run_enso_pipeline())
        results.append(await cls.run_iod_pipeline())
        results.append(await cls.run_mjo_pipeline())
        results.append(await cls.run_weather_and_features_pipeline())
        return results
