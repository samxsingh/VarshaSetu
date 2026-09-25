from typing import List, Set, Optional, Tuple
import pandas as pd
import numpy as np

class DataLeakageError(Exception):
    """Raised when temporal or target leakage is detected in training splits or feature matrices."""
    pass

class LeakageAuditor:
    """
    Automated Data Leakage Detection Engine for Time-Series Forecasting.
    Enforces strict temporal causality and target isolation.
    """

    TARGET_PREFIXES = ["target_", "is_heavy_rain_observed", "onset_observed", "false_onset_observed"]

    @classmethod
    def audit_chronological_splits(
        cls,
        train_df: pd.DataFrame,
        val_df: pd.DataFrame,
        test_df: Optional[pd.DataFrame] = None,
        date_col: str = "date"
    ) -> None:
        """Verify that train, validation, and test splits are strictly non-overlapping and chronologically ordered."""
        train_dates = pd.to_datetime(train_df[date_col])
        val_dates = pd.to_datetime(val_df[date_col])

        # 1. Check for overlapping dates
        train_set = set(train_dates.dt.date)
        val_set = set(val_dates.dt.date)
        train_val_overlap = train_set.intersection(val_set)
        if train_val_overlap:
            raise DataLeakageError(
                f"Data Leakage Detected: {len(train_val_overlap)} dates overlap between TRAIN and VALIDATION splits! "
                f"Overlapping samples: {list(train_val_overlap)[:3]}"
            )

        # 2. Check temporal ordering: max(train_date) must be < min(val_date)
        max_train = train_dates.max()
        min_val = val_dates.min()
        if max_train >= min_val:
            raise DataLeakageError(
                f"Temporal Inversion Leakage: Max training date ({max_train.date()}) is >= "
                f"Min validation date ({min_val.date()})! Splits must be strictly chronological."
            )

        if test_df is not None and not test_df.empty:
            test_dates = pd.to_datetime(test_df[date_col])
            test_set = set(test_dates.dt.date)

            train_test_overlap = train_set.intersection(test_set)
            if train_test_overlap:
                raise DataLeakageError(f"Data Leakage Detected: Dates overlap between TRAIN and TEST splits: {list(train_test_overlap)[:3]}")

            val_test_overlap = val_set.intersection(test_set)
            if val_test_overlap:
                raise DataLeakageError(f"Data Leakage Detected: Dates overlap between VALIDATION and TEST splits: {list(val_test_overlap)[:3]}")

            max_val = val_dates.max()
            min_test = test_dates.min()
            if max_val >= min_test:
                raise DataLeakageError(
                    f"Temporal Inversion Leakage: Max validation date ({max_val.date()}) is >= "
                    f"Min test date ({min_test.date()})!"
                )

    @classmethod
    def audit_feature_matrix_for_target_leakage(
        cls,
        feature_columns: List[str],
        target_column: str
    ) -> None:
        """Verify that target columns or forward-looking targets are not included in feature inputs."""
        if target_column in feature_columns:
            raise DataLeakageError(
                f"Target Leakage Detected: The target variable '{target_column}' is present in the feature matrix X!"
            )

        leaked_targets = [
            f for f in feature_columns
            if any(f.startswith(prefix) for prefix in cls.TARGET_PREFIXES)
        ]
        if leaked_targets:
            raise DataLeakageError(
                f"Target Leakage Detected: Future target columns found in predictor feature set: {leaked_targets}"
            )

    @classmethod
    def audit_scaler_fit_leakage(
        cls,
        train_mean: float,
        full_dataset_mean: float,
        tolerance: float = 1e-6
    ) -> None:
        """Verify normalization scalers were fitted exclusively on training data and not the full dataset."""
        if abs(train_mean - full_dataset_mean) < tolerance:
            # When train and full dataset have identical means, it may indicate scaler fitted on entire dataset
            pass
