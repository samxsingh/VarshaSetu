"""
VarshaSetu - Walk-Forward Hindcasting Fold Generator
Generates strictly expanding-window chronological folds for historical validation.
Guarantees temporal ordering with zero future lookahead leakage:
max(train_date) < min(validation_date) < min(test_date).
"""

from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

from ..datasets.fingerprint import compute_dataframe_fingerprint
from .schemas import HindcastFold


def generate_hindcast_folds(
    df: pd.DataFrame,
    date_col: str = "date",
    min_train_years: int = 2,
    min_train_records: int = 30,
    min_val_records: int = 14,
    min_test_records: int = 14
) -> List[HindcastFold]:
    """
    Generates chronological walk-forward folds.
    If multi-year data is available, generates year-level walk-forward folds.
    If only a single season is available, generates diagnostic within-season walk-forward folds.
    """
    if df is None or len(df) == 0:
        return []

    df = df.copy()
    df[date_col] = pd.to_datetime(df[date_col])
    df = df.sort_values(by=date_col).reset_index(drop=True)
    df["_year"] = df[date_col].dt.year

    distinct_years = sorted([int(y) for y in df["_year"].unique()])
    folds: List[HindcastFold] = []

    # CASE 1: Multi-year data available (>= 3 years for train, val, test)
    if len(distinct_years) >= 3:
        for i in range(2, len(distinct_years)):
            test_year = distinct_years[i]
            val_year = distinct_years[i - 1]
            train_years = distinct_years[: i - 1]

            train_df = df[df["_year"].isin(train_years)]
            val_df = df[df["_year"] == val_year]
            test_df = df[df["_year"] == test_year]

            if len(train_df) < min_train_records or len(val_df) < min_val_records or len(test_df) < min_test_records:
                continue

            # Verify no leakage
            max_train_date = train_df[date_col].max()
            min_val_date = val_df[date_col].min()
            max_val_date = val_df[date_col].max()
            min_test_date = test_df[date_col].min()

            assert max_train_date < min_val_date, f"Temporal leakage: train {max_train_date} >= val {min_val_date}"
            assert max_val_date < min_test_date, f"Temporal leakage: val {max_val_date} >= test {min_test_date}"

            fold_id = f"fold_multiyear_{test_year}"
            fingerprint = compute_dataframe_fingerprint(df.iloc[: len(train_df) + len(val_df) + len(test_df)])

            folds.append(HindcastFold(
                fold_id=fold_id,
                train_start=str(train_df[date_col].min().date()),
                train_end=str(max_train_date.date()),
                validation_start=str(min_val_date.date()),
                validation_end=str(max_val_date.date()),
                test_start=str(min_test_date.date()),
                test_end=str(test_df[date_col].max().date()),
                test_year=test_year,
                training_rows=len(train_df),
                validation_rows=len(val_df),
                test_rows=len(test_df),
                training_years=train_years,
                feature_cutoff=str(max_train_date.date()),
                dataset_fingerprint=fingerprint[:16],
                notes=f"Multi-year hindcast fold testing {test_year} against models trained on {train_years}."
            ))

    # CASE 2: Single-year or limited season (Diagnostic within-season walk-forward)
    if not folds:
        total_rows = len(df)
        if total_rows >= (min_train_records + min_val_records + min_test_records):
            # Split season into progressive forward slices (e.g. 50% train, 25% val, 25% test; then 70% train, 15% val, 15% test)
            slice_configs = [
                (0.50, 0.25, 0.25, "fold_diagnostic_midseason"),
                (0.70, 0.15, 0.15, "fold_diagnostic_lateseason")
            ]

            for tr_frac, val_frac, te_frac, fid in slice_configs:
                n_tr = int(total_rows * tr_frac)
                n_val = int(total_rows * val_frac)
                n_te = total_rows - n_tr - n_val

                train_df = df.iloc[:n_tr]
                val_df = df.iloc[n_tr : n_tr + n_val]
                test_df = df.iloc[n_tr + n_val :]

                if len(train_df) < min_train_records or len(val_df) < min_val_records or len(test_df) < min_test_records:
                    continue

                max_train_date = train_df[date_col].max()
                min_val_date = val_df[date_col].min()
                max_val_date = val_df[date_col].max()
                min_test_date = test_df[date_col].min()

                assert max_train_date < min_val_date, f"Leakage: train {max_train_date} >= val {min_val_date}"
                assert max_val_date < min_test_date, f"Leakage: val {max_val_date} >= test {min_test_date}"

                year_val = int(df["_year"].iloc[0])
                fingerprint = compute_dataframe_fingerprint(df)

                folds.append(HindcastFold(
                    fold_id=fid,
                    train_start=str(train_df[date_col].min().date()),
                    train_end=str(max_train_date.date()),
                    validation_start=str(min_val_date.date()),
                    validation_end=str(max_val_date.date()),
                    test_start=str(min_test_date.date()),
                    test_end=str(test_df[date_col].max().date()),
                    test_year=year_val,
                    training_rows=len(train_df),
                    validation_rows=len(val_df),
                    test_rows=len(test_df),
                    training_years=[year_val],
                    feature_cutoff=str(max_train_date.date()),
                    dataset_fingerprint=fingerprint[:16],
                    notes="Diagnostic within-season chronological walk-forward fold (single-season Kharif archive)."
                ))

    return folds
