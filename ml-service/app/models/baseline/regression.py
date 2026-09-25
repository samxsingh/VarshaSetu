from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
import numpy as np
import pandas as pd
from .metadata import ModelMetadata, PreprocessingMetadata

class BaselineRegressionModel:
    """
    Ridge (L2-Regularized) Linear Regression Baseline Model for Continuous Rainfall Targets.
    Calculates closed-form solution: w = (X^T X + lambda * I)^(-1) X^T y
    with non-negative constraint option for physical rainfall sums.
    """

    def __init__(
        self,
        alpha: float = 1.0,
        target_name: str = "rainfall_amount",
        horizon_days: int = 7,
        non_negative: bool = True
    ):
        self.alpha = alpha
        self.target_name = target_name
        self.horizon_days = horizon_days
        self.non_negative = non_negative

        self.weights: Optional[np.ndarray] = None
        self.intercept: float = 0.0
        self.feature_names: List[str] = []
        self.preprocessing: Optional[PreprocessingMetadata] = None
        self.training_period: str = "N/A"
        self.validation_period: str = "N/A"

    def fit_preprocessing(self, X_df: pd.DataFrame) -> Tuple[np.ndarray, PreprocessingMetadata]:
        self.feature_names = list(X_df.columns)
        means: Dict[str, float] = {}
        stds: Dict[str, float] = {}
        defaults: Dict[str, float] = {}

        X_norm = np.zeros(X_df.shape, dtype=float)

        for j, col in enumerate(self.feature_names):
            vals = pd.to_numeric(X_df[col], errors="coerce")
            mean_val = float(vals.mean()) if not vals.dropna().empty else 0.0
            std_val = float(vals.std()) if not vals.dropna().empty else 1.0
            if std_val < 1e-6:
                std_val = 1.0

            means[col] = round(mean_val, 4)
            stds[col] = round(std_val, 4)
            defaults[col] = round(mean_val, 4)

            filled = vals.fillna(mean_val).to_numpy(dtype=float)
            X_norm[:, j] = (filled - mean_val) / std_val

        self.preprocessing = PreprocessingMetadata(
            feature_names=self.feature_names,
            feature_means=means,
            feature_stds=stds,
            imputed_defaults=defaults,
            training_sample_count=len(X_df)
        )
        return X_norm, self.preprocessing

    def transform(self, X_df: pd.DataFrame) -> np.ndarray:
        if self.preprocessing is None:
            raise ValueError("Model preprocessing has not been fitted.")

        X_norm = np.zeros((len(X_df), len(self.feature_names)), dtype=float)
        for j, col in enumerate(self.feature_names):
            if col in X_df.columns:
                vals = pd.to_numeric(X_df[col], errors="coerce")
                mean_val = self.preprocessing.feature_means.get(col, 0.0)
                std_val = self.preprocessing.feature_stds.get(col, 1.0)
                filled = vals.fillna(mean_val).to_numpy(dtype=float)
                X_norm[:, j] = (filled - mean_val) / std_val
            else:
                X_norm[:, j] = 0.0

        return X_norm

    def fit(
        self,
        X_df: pd.DataFrame,
        y: pd.Series,
        training_period: str = "N/A"
    ) -> "BaselineRegressionModel":
        self.training_period = training_period
        y_clean = pd.to_numeric(y, errors="coerce").fillna(0.0).to_numpy(dtype=float)

        X_norm, _ = self.fit_preprocessing(X_df)
        n_samples, n_features = X_norm.shape

        if n_samples == 0:
            raise ValueError("Cannot fit regression baseline on 0 samples.")

        # Center y to find intercept: intercept = mean(y)
        y_mean = float(np.mean(y_clean))
        self.intercept = y_mean
        y_centered = y_clean - y_mean

        # Ridge closed form: w = (X^T X + alpha * I)^(-1) X^T y
        reg_matrix = self.alpha * np.eye(n_features)
        A = np.dot(X_norm.T, X_norm) + reg_matrix
        b = np.dot(X_norm.T, y_centered)

        self.weights = np.linalg.solve(A, b)
        return self

    def predict(self, X_df: pd.DataFrame) -> np.ndarray:
        if self.preprocessing is None or self.weights is None:
            raise ValueError("Model is not fitted.")

        X_norm = self.transform(X_df)
        preds = np.dot(X_norm, self.weights) + self.intercept

        if self.non_negative:
            preds = np.maximum(preds, 0.0)

        return np.round(preds, 2)

    def get_metadata(self) -> ModelMetadata:
        coeffs = {}
        if self.weights is not None:
            for feat, w in zip(self.feature_names, self.weights):
                coeffs[feat] = float(round(w, 4))

        return ModelMetadata(
            model_id=f"ridge_baseline_{self.target_name}_{self.horizon_days}d",
            model_type="LINEAR_REGRESSION_BASELINE",
            target_name=self.target_name,
            horizon_days=self.horizon_days,
            training_period=self.training_period,
            validation_period=self.validation_period,
            feature_names=self.feature_names,
            hyperparameters={
                "alpha": self.alpha,
                "non_negative": self.non_negative
            },
            fitted_at=datetime.utcnow().isoformat(),
            preprocessing=self.preprocessing or PreprocessingMetadata(
                feature_names=[], feature_means={}, feature_stds={}, imputed_defaults={}, training_sample_count=0
            ),
            coefficients=coeffs,
            intercept=float(round(self.intercept, 4)),
            scientific_status="BASELINE_TRAINED"
        )
