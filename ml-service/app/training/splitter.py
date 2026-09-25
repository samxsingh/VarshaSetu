from dataclasses import dataclass
from typing import Optional, Tuple
import pandas as pd
import numpy as np
from .leakage import LeakageAuditor

@dataclass
class DatasetSplits:
    train: pd.DataFrame
    val: pd.DataFrame
    test: pd.DataFrame
    train_dates: Tuple[str, str]
    val_dates: Tuple[str, str]
    test_dates: Tuple[str, str]
    train_records: int
    val_records: int
    test_records: int

class ChronologicalSplitter:
    """
    Chronological Train / Validation / Test Splitting Framework for Time-Series Forecasting.
    Enforces non-random, forward-marching splits with automated leakage auditing.
    """

    @classmethod
    def split_by_ratio(
        cls,
        df: pd.DataFrame,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
        date_col: str = "date"
    ) -> DatasetSplits:
        if abs(train_ratio + val_ratio + test_ratio - 1.0) > 1e-4:
            raise ValueError("Train, validation, and test ratios must sum to 1.0.")

        data = df.sort_values(date_col).reset_index(drop=True)
        n = len(data)
        if n < 10:
            raise ValueError(f"Insufficient records ({n}) to partition into 3 chronological splits.")

        train_end_idx = int(n * train_ratio)
        val_end_idx = int(n * (train_ratio + val_ratio))

        train_df = data.iloc[:train_end_idx].copy().reset_index(drop=True)
        val_df = data.iloc[train_end_idx:val_end_idx].copy().reset_index(drop=True)
        test_df = data.iloc[val_end_idx:].copy().reset_index(drop=True)

        # Audit splits for zero overlap and correct temporal ordering
        LeakageAuditor.audit_chronological_splits(train_df, val_df, test_df, date_col=date_col)

        return DatasetSplits(
            train=train_df,
            val=val_df,
            test=test_df,
            train_dates=(str(train_df[date_col].min()), str(train_df[date_col].max())),
            val_dates=(str(val_df[date_col].min()), str(val_df[date_col].max())),
            test_dates=(str(test_df[date_col].min()), str(test_df[date_col].max())),
            train_records=len(train_df),
            val_records=len(val_df),
            test_records=len(test_df)
        )

    @classmethod
    def split_by_dates(
        cls,
        df: pd.DataFrame,
        train_end_date: str,
        val_end_date: str,
        date_col: str = "date"
    ) -> DatasetSplits:
        data = df.sort_values(date_col).reset_index(drop=True)
        d_series = pd.to_datetime(data[date_col])

        t_end = pd.to_datetime(train_end_date)
        v_end = pd.to_datetime(val_end_date)

        if t_end >= v_end:
            raise ValueError(f"Train end date ({train_end_date}) must be prior to val end date ({val_end_date}).")

        train_df = data[d_series <= t_end].copy().reset_index(drop=True)
        val_df = data[(d_series > t_end) & (d_series <= v_end)].copy().reset_index(drop=True)
        test_df = data[d_series > v_end].copy().reset_index(drop=True)

        if train_df.empty or val_df.empty or test_df.empty:
            raise ValueError(
                f"Date boundaries resulted in empty split: "
                f"train={len(train_df)}, val={len(val_df)}, test={len(test_df)}"
            )

        LeakageAuditor.audit_chronological_splits(train_df, val_df, test_df, date_col=date_col)

        return DatasetSplits(
            train=train_df,
            val=val_df,
            test=test_df,
            train_dates=(str(train_df[date_col].min()), str(train_df[date_col].max())),
            val_dates=(str(val_df[date_col].min()), str(val_df[date_col].max())),
            test_dates=(str(test_df[date_col].min()), str(test_df[date_col].max())),
            train_records=len(train_df),
            val_records=len(val_df),
            test_records=len(test_df)
        )
