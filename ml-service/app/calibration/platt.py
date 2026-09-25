"""
VarshaSetu - Platt (Logistic) Calibration
Fits parametric sigmoid mapping: P(y=1|p) = 1 / (1 + exp(A * p + B)).
Implements common calibrator interface.
"""

from typing import Dict, Any, Optional
import numpy as np
from scipy.optimize import minimize


class PlattCalibrator:
    """
    Parametric Platt Scaling calibrator.
    Maps uncalibrated model probabilities to empirically aligned posterior probabilities.
    """

    EPSILON = 1e-6

    def __init__(self, regularize: bool = True):
        self.regularize = regularize
        self.a: float = -1.0  # slope parameter: P(y=1|p) = 1 / (1 + exp(a*p + b))
        self.b: float = 0.0   # intercept parameter
        self.is_fitted: bool = False
        self._status: str = "UNFITTED"
        self.probabilities_clipped: bool = False
        self.sample_count: int = 0
        self.positive_count: int = 0
        self.negative_count: int = 0

    def fit(self, probabilities: np.ndarray, observations: np.ndarray) -> "PlattCalibrator":
        probs = np.asarray(probabilities, dtype=float)
        obs = np.asarray(observations, dtype=float)

        self.sample_count = len(probs)
        self.positive_count = int(np.sum(obs == 1))
        self.negative_count = int(np.sum(obs == 0))

        if self.sample_count < 10 or self.positive_count < 1 or self.negative_count < 1:
            self.is_fitted = False
            self._status = "FAILED_INSUFFICIENT_SAMPLES"
            return self

        # Check clipping
        if np.any(probs <= self.EPSILON) or np.any(probs >= 1.0 - self.EPSILON):
            self.probabilities_clipped = True
        p_clipped = np.clip(probs, self.EPSILON, 1.0 - self.EPSILON)

        # Loss function: Negative Log-Likelihood with mild L2 regularization
        def loss_fn(params):
            a, b = params
            z = a * p_clipped + b
            z_safe = np.clip(z, -30.0, 30.0)
            p_hat = 1.0 / (1.0 + np.exp(-z_safe))
            p_hat_safe = np.clip(p_hat, 1e-12, 1.0 - 1e-12)
            nll = -np.mean(obs * np.log(p_hat_safe) + (1.0 - obs) * np.log(1.0 - p_hat_safe))
            reg = 1e-4 * (a ** 2 + b ** 2) if self.regularize else 0.0
            return nll + reg

        init_params = [-1.0, 0.0]
        res = minimize(loss_fn, init_params, method="L-BFGS-B")

        if res.success:
            self.a = float(res.x[0])
            self.b = float(res.x[1])
            self.is_fitted = True
            self._status = "FITTED"
        else:
            self.is_fitted = False
            self._status = "FAILED_OPTIMIZATION"

        return self

    def predict(self, probabilities: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            # If not fitted, return raw probabilities untouched
            return np.asarray(probabilities, dtype=float)

        probs = np.asarray(probabilities, dtype=float)
        p_clipped = np.clip(probs, self.EPSILON, 1.0 - self.EPSILON)
        z = self.a * p_clipped + self.b
        z_safe = np.clip(z, -30.0, 30.0)
        return 1.0 / (1.0 + np.exp(-z_safe))

    def status(self) -> str:
        return self._status

    def metadata(self) -> Dict[str, Any]:
        return {
            "method": "PLATT_SCALING",
            "is_fitted": self.is_fitted,
            "status": self._status,
            "parameters": {
                "slope_a": round(self.a, 5),
                "intercept_b": round(self.b, 5)
            },
            "sample_count": self.sample_count,
            "positive_count": self.positive_count,
            "negative_count": self.negative_count,
            "probabilities_clipped": self.probabilities_clipped,
            "clipping_epsilon": self.EPSILON
        }
