"""
VarshaSetu - Calibration Data Gate
Evaluates empirical data sufficiency before permitting probability calibration.
Enforces rigorous statistical sample thresholds (observations, event counts,
multi-year span) to prevent ungrounded calibration claims on limited cohorts.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from .schemas import CalibrationGateStatus, CalibrationDataGateReport


class CalibrationDataGate:
    """
    Data Sufficiency Gate for Probabilistic Calibration.
    NOTE: Configured thresholds represent engineering guardrails designed to guarantee
    adequate statistical power and class coverage. They are not universal meteorological laws.
    """

    def __init__(
        self,
        min_calibration_samples: int = 100,
        min_calibration_positive: int = 30,
        min_calibration_negative: int = 30,
        min_calibration_years: int = 5,
        min_test_samples: int = 30,
        min_diagnostic_samples: int = 15,
        min_diagnostic_events: int = 2,
        max_missingness_ratio: float = 0.20
    ):
        self.min_calibration_samples = min_calibration_samples
        self.min_calibration_positive = min_calibration_positive
        self.min_calibration_negative = min_calibration_negative
        self.min_calibration_years = min_calibration_years
        self.min_test_samples = min_test_samples
        self.min_diagnostic_samples = min_diagnostic_samples
        self.min_diagnostic_events = min_diagnostic_events
        self.max_missingness_ratio = max_missingness_ratio

    def evaluate(
        self,
        train_df: pd.DataFrame,
        val_df: pd.DataFrame,
        test_df: pd.DataFrame,
        target_col: str,
        date_col: str = "date"
    ) -> CalibrationDataGateReport:
        passed_checks = []
        failed_checks = []

        total_obs = len(train_df) + len(val_df) + len(test_df)
        val_samples = len(val_df)
        test_samples = len(test_df)

        # Concatenate for global temporal checks
        all_dfs = [df for df in [train_df, val_df, test_df] if not df.empty]
        if not all_dfs:
            return CalibrationDataGateReport(
                status=CalibrationGateStatus.INSUFFICIENT_DATA,
                train_observations=0,
                val_observations=0,
                test_observations=0,
                positive_class_count=0,
                negative_class_count=0,
                unique_seasons=0,
                unique_years=0,
                target_variance=0.0,
                event_frequency=0.0,
                missingness_ratio=1.0,
                thresholds=self._get_thresholds_dict(),
                passed_checks=[],
                failed_checks=["Empty dataset provided."],
                operational_calibration_allowed=False,
                scientific_notes="Data gate rejected: Empty input partitions."
            )

        combined = pd.concat(all_dfs, ignore_index=True)

        # 1. Target checks
        if target_col not in combined.columns:
            return CalibrationDataGateReport(
                status=CalibrationGateStatus.INSUFFICIENT_DATA,
                train_observations=len(train_df),
                val_observations=val_samples,
                test_observations=test_samples,
                positive_class_count=0,
                negative_class_count=0,
                unique_seasons=0,
                unique_years=0,
                target_variance=0.0,
                event_frequency=0.0,
                missingness_ratio=1.0,
                thresholds=self._get_thresholds_dict(),
                passed_checks=[],
                failed_checks=[f"Target column '{target_col}' missing from dataset."],
                operational_calibration_allowed=False,
                scientific_notes=f"Data gate rejected: target '{target_col}' not found."
            )

        y_all = combined[target_col].dropna()
        missing_count = int(combined[target_col].isna().sum())
        missing_ratio = round(missing_count / max(1, len(combined)), 4)

        if missing_ratio <= self.max_missingness_ratio:
            passed_checks.append(f"Target missingness ({missing_ratio*100:.1f}%) within limit ({self.max_missingness_ratio*100:.0f}%)")
        else:
            failed_checks.append(f"High target missingness: {missing_ratio*100:.1f}% > {self.max_missingness_ratio*100:.0f}%")

        # Class counts in validation partition (where calibrator fits)
        if target_col in val_df.columns:
            val_y = val_df[target_col].dropna()
            is_binary = set(val_y.unique()).issubset({0, 1, 0.0, 1.0})
            if is_binary:
                val_pos = int((val_y == 1).sum())
                val_neg = int((val_y == 0).sum())
            else:
                val_pos = int((val_y > 0).sum())
                val_neg = int((val_y <= 0).sum())
        else:
            val_pos, val_neg = 0, 0

        target_var = float(round(y_all.var(), 4)) if len(y_all) > 1 else 0.0
        tot_pos = int((y_all == 1).sum()) if set(y_all.unique()).issubset({0, 1, 0.0, 1.0}) else int((y_all > 0).sum())
        event_freq = float(round(tot_pos / max(1, len(y_all)), 4))

        # 2. Temporal & Seasonality checks
        if date_col in combined.columns:
            dates = pd.to_datetime(combined[date_col]).dropna()
            unique_years = int(dates.dt.year.nunique())
            # Estimate unique monsoon seasons (Kharif: June-Sept)
            monsoon_months = dates[dates.dt.month.isin([6, 7, 8, 9])]
            unique_seasons = int(monsoon_months.dt.year.nunique())
        else:
            unique_years = 1
            unique_seasons = 1

        # Check: Calibration samples count
        if val_samples >= self.min_calibration_samples:
            passed_checks.append(f"Validation sample count ({val_samples}) meets minimum ({self.min_calibration_samples})")
        else:
            failed_checks.append(f"Validation sample count ({val_samples}) below operational minimum ({self.min_calibration_samples})")

        # Check: Positive and negative events
        if val_pos >= self.min_calibration_positive and val_neg >= self.min_calibration_negative:
            passed_checks.append(f"Validation class balance (pos={val_pos}, neg={val_neg}) satisfies operational threshold (30/30)")
        else:
            failed_checks.append(f"Validation class occurrences (pos={val_pos}, neg={val_neg}) below required minimum ({self.min_calibration_positive}/{self.min_calibration_negative})")

        # Check: Multi-year span
        if unique_years >= self.min_calibration_years:
            passed_checks.append(f"Historical span ({unique_years} years) satisfies multi-year requirement ({self.min_calibration_years} years)")
        else:
            failed_checks.append(f"Historical span ({unique_years} year(s)) does not satisfy multi-year requirement ({self.min_calibration_years} years)")

        # Check: Test sample count
        if test_samples >= self.min_test_samples:
            passed_checks.append(f"Test sample count ({test_samples}) meets minimum ({self.min_test_samples})")
        else:
            failed_checks.append(f"Test sample count ({test_samples}) below minimum ({self.min_test_samples})")

        # 3. Status Determination
        can_operate = (
            val_samples >= self.min_calibration_samples
            and val_pos >= self.min_calibration_positive
            and val_neg >= self.min_calibration_negative
            and unique_years >= self.min_calibration_years
            and test_samples >= self.min_test_samples
            and missing_ratio <= self.max_missingness_ratio
        )

        can_diagnose = (
            val_samples >= self.min_diagnostic_samples
            and val_pos >= self.min_diagnostic_events
            and val_neg >= self.min_diagnostic_events
            and test_samples >= self.min_diagnostic_samples
        )

        if can_operate:
            status = CalibrationGateStatus.PASSED
            notes = "Data gate PASSED. Dataset satisfies multi-year volume, balance, and test holdout criteria for operational calibration."
        elif can_diagnose:
            status = CalibrationGateStatus.DIAGNOSTIC_ONLY
            notes = (
                f"Data gate DIAGNOSTIC ONLY. Validation set has {val_samples} samples (pos={val_pos}, neg={val_neg}) across {unique_years} year(s). "
                "Sufficient for diagnostic reliability diagrams and experimental walk-forward evaluation, "
                "but strictly INSUFFICIENT for operational calibration deployment."
            )
        else:
            status = CalibrationGateStatus.INSUFFICIENT_DATA
            notes = (
                f"Data gate INSUFFICIENT DATA. Insufficient sample size (val={val_samples}, test={test_samples}) "
                f"or zero/near-zero event representation (pos={val_pos}, neg={val_neg}). Calibration and reliability diagnostics disabled."
            )

        return CalibrationDataGateReport(
            status=status,
            train_observations=len(train_df),
            val_observations=val_samples,
            test_observations=test_samples,
            positive_class_count=val_pos,
            negative_class_count=val_neg,
            unique_seasons=unique_seasons,
            unique_years=unique_years,
            target_variance=target_var,
            event_frequency=event_freq,
            missingness_ratio=missing_ratio,
            thresholds=self._get_thresholds_dict(),
            passed_checks=passed_checks,
            failed_checks=failed_checks,
            operational_calibration_allowed=can_operate,
            scientific_notes=notes
        )

    def _get_thresholds_dict(self) -> Dict[str, Any]:
        return {
            "min_calibration_samples": self.min_calibration_samples,
            "min_calibration_positive": self.min_calibration_positive,
            "min_calibration_negative": self.min_calibration_negative,
            "min_calibration_years": self.min_calibration_years,
            "min_test_samples": self.min_test_samples,
            "min_diagnostic_samples": self.min_diagnostic_samples,
            "min_diagnostic_events": self.min_diagnostic_events,
            "max_missingness_ratio": self.max_missingness_ratio,
            "threshold_nature": "Engineering guardrails for statistical stability; not universal physical laws."
        }
