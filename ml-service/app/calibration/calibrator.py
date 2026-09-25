"""
VarshaSetu - Unified Calibrator & Chronological Walk-Forward Engine
Enforces expanding-window chronological validation without random shuffling.
Fits calibration models strictly on out-of-sample validation predictions.
"""

from typing import Dict, Any, List, Optional, Tuple, Literal
import numpy as np
import pandas as pd

from .platt import PlattCalibrator
from .isotonic import IsotonicCalibrator


class ChronologicalFold(BaseModel_Fold := dict):
    pass


class ModelProbabilityCalibrator:
    """
    Unified Calibrator supporting Platt scaling and Isotonic regression
    with strictly chronological expanding-window out-of-sample generation.
    """

    def __init__(self, method: Literal["PLATT", "ISOTONIC"] = "PLATT"):
        self.method = method.upper()
        if self.method == "PLATT":
            self.calibrator = PlattCalibrator()
        elif self.method == "ISOTONIC":
            self.calibrator = IsotonicCalibrator()
        else:
            raise ValueError(f"Unsupported calibration method: {method}. Must be 'PLATT' or 'ISOTONIC'.")

    def fit(self, val_probs: np.ndarray, val_labels: np.ndarray) -> "ModelProbabilityCalibrator":
        self.calibrator.fit(val_probs, val_labels)
        return self

    def predict(self, test_probs: np.ndarray) -> np.ndarray:
        return self.calibrator.predict(test_probs)

    def status(self) -> str:
        return self.calibrator.status()

    def metadata(self) -> Dict[str, Any]:
        return self.calibrator.metadata()

    @classmethod
    def generate_expanding_folds(
        cls,
        df: pd.DataFrame,
        date_col: str = "date",
        n_folds: int = 3,
        min_train_ratio: float = 0.50
    ) -> List[Dict[str, Any]]:
        """
        Creates expanding-window chronological folds.
        Ensures max(train_date) < min(val_date) for every fold with zero shuffling.
        """
        df_sorted = df.sort_values(by=date_col).reset_index(drop=True)
        total_len = len(df_sorted)

        if total_len < 30:
            # Too small for multi-fold expansion
            split_point = int(total_len * 0.7)
            return [{
                "fold_id": 1,
                "train_indices": list(range(0, split_point)),
                "val_indices": list(range(split_point, total_len)),
                "train_start": str(df_sorted[date_col].iloc[0]),
                "train_end": str(df_sorted[date_col].iloc[split_point - 1]),
                "val_start": str(df_sorted[date_col].iloc[split_point]),
                "val_end": str(df_sorted[date_col].iloc[-1]),
                "train_count": split_point,
                "val_count": total_len - split_point
            }]

        min_train_size = int(total_len * min_train_ratio)
        remaining = total_len - min_train_size
        step = max(5, remaining // n_folds)

        folds = []
        for i in range(n_folds):
            val_start = min_train_size + i * step
            val_end = min_train_size + (i + 1) * step if i < n_folds - 1 else total_len

            if val_start >= total_len:
                break

            train_idx = list(range(0, val_start))
            val_idx = list(range(val_start, val_end))

            folds.append({
                "fold_id": i + 1,
                "train_indices": train_idx,
                "val_indices": val_idx,
                "train_start": str(df_sorted[date_col].iloc[train_idx[0]]),
                "train_end": str(df_sorted[date_col].iloc[train_idx[-1]]),
                "val_start": str(df_sorted[date_col].iloc[val_idx[0]]),
                "val_end": str(df_sorted[date_col].iloc[val_idx[-1]]),
                "train_count": len(train_idx),
                "val_count": len(val_idx)
            })

        return folds
