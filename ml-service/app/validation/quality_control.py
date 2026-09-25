import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from ..schemas.ingestion import QualityReport, QualityFlag

class QualityController:
    # Physical validity boundaries
    BOUNDS = {
        "precipitation_sum_mm": (0.0, 500.0),    # mm/day (world record ~1825mm, India ~400-500mm daily)
        "temperature_2m_max_c": (-10.0, 55.0),   # °C
        "temperature_2m_min_c": (-15.0, 45.0),   # °C
        "temperature_2m_mean_c": (-12.0, 50.0),  # °C
        "surface_pressure_hpa": (850.0, 1060.0), # hPa
        "wind_speed_10m_mps": (0.0, 65.0),       # m/s
        "relative_humidity_2m_pct": (0.0, 100.0),# %
        "nino34_sst": (18.0, 34.0),              # °C
        "anomaly": (-5.0, 5.0),                  # °C anomaly
        "dmi_value": (-3.0, 3.0),                # °C
        "rmm1": (-10.0, 10.0),
        "rmm2": (-10.0, 10.0),
    }

    @classmethod
    def audit_dataframe(
        cls,
        df: pd.DataFrame,
        dataset_name: str,
        time_col: str = "date"
    ) -> Tuple[pd.DataFrame, QualityReport]:
        """Run comprehensive scientific QC and assign quality flags."""
        if df.empty:
            report = QualityReport(
                dataset_name=dataset_name,
                total_records=0,
                valid_records=0,
                missing_records=0,
                outlier_records=0,
                quality_score=0.0,
                quality_flag=QualityFlag.BAD,
                details={"error": "Empty DataFrame"}
            )
            return df, report

        df = df.copy()
        initial_count = len(df)

        # 1. Deduplicate timestamps
        if time_col in df.columns:
            duplicates = df.duplicated(subset=[time_col]).sum()
            df = df.drop_duplicates(subset=[time_col], keep="last")
        else:
            duplicates = 0

        # 2. Check physical bounds and missing values
        outlier_mask = pd.Series(False, index=df.index)
        missing_mask = df.isna().any(axis=1)

        for col, (min_val, max_val) in cls.BOUNDS.items():
            if col in df.columns:
                col_outliers = (df[col] < min_val) | (df[col] > max_val)
                outlier_mask = outlier_mask | col_outliers

        # 3. Assign quality flags per row
        conditions = [
            outlier_mask,
            missing_mask,
        ]
        choices = [
            QualityFlag.BAD.value,
            QualityFlag.MISSING.value,
        ]
        df["quality_flag"] = np.select(conditions, choices, default=QualityFlag.GOOD.value)

        # 4. Generate summary report
        valid_count = int((df["quality_flag"] == QualityFlag.GOOD.value).sum())
        outlier_count = int(outlier_mask.sum())
        missing_count = int(missing_mask.sum())
        score = valid_count / initial_count if initial_count > 0 else 0.0

        if score >= 0.95:
            overall_flag = QualityFlag.GOOD
        elif score >= 0.80:
            overall_flag = QualityFlag.WARNING
        else:
            overall_flag = QualityFlag.BAD

        report = QualityReport(
            dataset_name=dataset_name,
            total_records=initial_count,
            valid_records=valid_count,
            missing_records=missing_count,
            outlier_records=outlier_count,
            quality_score=round(score, 3),
            quality_flag=overall_flag,
            details={
                "deduplicated_records": int(duplicates),
                "retained_records": len(df),
            }
        )

        return df, report
