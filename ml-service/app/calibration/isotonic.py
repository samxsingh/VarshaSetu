"""
VarshaSetu - Isotonic Regression Calibration
Fits non-parametric monotonic step function.
Implements common calibrator interface.
"""

from typing import Dict, Any, Optional
import numpy as np
from sklearn.isotonic import IsotonicRegression


class IsotonicCalibrator:
    """
    Non-parametric Isotonic Regression Calibrator.
    Fits a monotonic non-decreasing mapping from uncalibrated predictions to empirical event rates.
    """

    EPSILON = 1e-6

    def __init__(self):
        self.regressor = IsotonicRegression(out_of_bounds="clip", y_min=0.0, y_max=1.0)
        self.is_fitted: bool = False
        self._status: str = "UNFITTED"
        self.probabilities_clipped: bool = False
        self.sample_count: int = 0
        self.positive_count: int = 0
        self.negative_count: int = 0

    def fit(self, probabilities: np.ndarray, observations: np.ndarray) -> "IsotonicCalibrator":
        probs = np.asarray(probabilities, dtype=float)
        obs = np.asarray(observations, dtype=float)

        self.sample_count = len(probs)
        self.positive_count = int(np.sum(obs == 1))
        self.negative_count = int(np.sum(obs == 0))

        if self.sample_count < 10 or self.positive_count < 1 or self.negative_count < 1:
            self.is_fitted = False
            self._status = "FAILED_INSUFFICIENT_SAMPLES"
            return self

        if np.any(probs <= self.EPSILON) or np.any(probs >= 1.0 - self.EPSILON):
            self.probabilities_clipped = True
        p_clipped = np.clip(probs, 0.0, 1.0)

        try:
            self.regressor.fit(p_clipped, obs)
            self.is_fitted = True
            self._status = "FITTED"
        except Exception:
            self.is_fitted = False
            self._status = "FAILED_FITTING"

        return self

    def predict(self, probabilities: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            return np.asarray(probabilities, dtype=float)

        probs = np.asarray(probabilities, dtype=float)
        p_clipped = np.clip(probs, 0.0, 1.0)
        preds = self.regressor.predict(p_clipped)
        return np.clip(preds, 0.0, 1.0)

    def status(self) -> str:
        return self._status

    def metadata(self) -> Dict[str, Any]:
        return {
            "method": "ISOTONIC_REGRESSION",
            "is_fitted": self.is_fitted,
            "status": self._status,
            "sample_count": self.sample_count,
            "positive_count": self.positive_count,
            "negative_count": self.negative_count,
            "probabilities_clipped": self.probabilities_clipped
        }
