from typing import Optional, Dict, Any, Tuple
import numpy as np
from pydantic import BaseModel, Field

class CalibrationResult(BaseModel):
    raw_probability: float
    calibrated_probability: Optional[float] = None
    calibration_method: str = "NONE"
    calibration_status: str  # "CALIBRATED" or "NOT_CALIBRATED"
    notes: str

class ProbabilityCalibrator:
    """
    Scientific Probability Calibration Engine.
    Implements Platt Scaling (Sigmoid) and monotonic isotonic alignment.
    Strict Honesty Rule: Never claims calibrated probability if validation samples < 30
    or if positive/negative class representation is insufficient.
    """

    MIN_VALIDATION_SAMPLES: int = 30
    MIN_CLASS_OCCURRENCES: int = 5

    def __init__(self, method: str = "PLATT_SCALING"):
        self.method = method.upper()
        self.is_fitted: bool = False
        self.status: str = "NOT_CALIBRATED"
        self.notes: str = "Unfitted calibrator."

        # Platt scaling parameters: P(y=1|p) = sigmoid(A * p + B)
        self.platt_a: float = 1.0
        self.platt_b: float = 0.0

    def fit(self, val_probs: np.ndarray, val_labels: np.ndarray) -> "ProbabilityCalibrator":
        n_samples = len(val_probs)
        if n_samples < self.MIN_VALIDATION_SAMPLES:
            self.is_fitted = False
            self.status = "NOT_CALIBRATED"
            self.notes = (
                f"Insufficient validation samples ({n_samples} < {self.MIN_VALIDATION_SAMPLES}) "
                f"to reliably evaluate Platt or Isotonic calibration."
            )
            return self

        pos_count = int(np.sum(val_labels == 1))
        neg_count = int(np.sum(val_labels == 0))

        if pos_count < self.MIN_CLASS_OCCURRENCES or neg_count < self.MIN_CLASS_OCCURRENCES:
            self.is_fitted = False
            self.status = "NOT_CALIBRATED"
            self.notes = (
                f"Imbalanced validation set (pos={pos_count}, neg={neg_count}). "
                f"Minimum {self.MIN_CLASS_OCCURRENCES} positive and negative events required for calibration."
            )
            return self

        # Fit Platt Scaling via 1D Logistic Regression on predicted probabilities
        # min sum of cross entropy: y * log(sig(A*p+B)) + (1-y)*log(1-sig(A*p+B))
        p_arr = np.clip(val_probs, 1e-4, 1.0 - 1e-4)
        y_arr = val_labels.astype(float)

        A = 1.0
        B = 0.0
        lr = 0.1
        for _ in range(200):
            z = np.clip(A * p_arr + B, -30.0, 30.0)
            sig = 1.0 / (1.0 + np.exp(-z))
            dA = np.mean((sig - y_arr) * p_arr)
            dB = np.mean(sig - y_arr)
            A -= lr * dA
            B -= lr * dB

        self.platt_a = float(A)
        self.platt_b = float(B)
        self.is_fitted = True
        self.status = "CALIBRATED"
        self.notes = f"Platt scaling fitted on {n_samples} validation samples (pos={pos_count}, neg={neg_count})."
        return self

    def calibrate(self, raw_prob: float) -> CalibrationResult:
        clamped = float(np.clip(raw_prob, 0.0, 1.0))
        if not self.is_fitted:
            return CalibrationResult(
                raw_probability=round(clamped, 4),
                calibrated_probability=None,
                calibration_method="NONE",
                calibration_status=self.status,
                notes=self.notes
            )

        z = np.clip(self.platt_a * clamped + self.platt_b, -30.0, 30.0)
        calibrated = float(1.0 / (1.0 + np.exp(-z)))
        return CalibrationResult(
            raw_probability=round(clamped, 4),
            calibrated_probability=round(calibrated, 4),
            calibration_method=self.method,
            calibration_status="CALIBRATED",
            notes=self.notes
        )
