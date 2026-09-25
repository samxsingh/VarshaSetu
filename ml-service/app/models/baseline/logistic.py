from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
import numpy as np
import pandas as pd
from .metadata import ModelMetadata, PreprocessingMetadata

class BaselineLogisticModel:
    """
    Penalized Logistic Regression Baseline Model for Binary Meteorological Targets.
    Implements L2-regularized logistic regression with training-only Z-score standardization.
    """

    def __init__(
        self,
        learning_rate: float = 0.05,
        max_iter: int = 500,
        l2_penalty: float = 0.1,
        target_name: str = "heavy_rain",
        horizon_days: int = 7
    ):
        self.learning_rate = learning_rate
        self.max_iter = max_iter
        self.l2_penalty = l2_penalty
        self.target_name = target_name
        self.horizon_days = horizon_days

        self.weights: Optional[np.ndarray] = None
        self.intercept: float = 0.0
        self.feature_names: List[str] = []
        self.preprocessing: Optional[PreprocessingMetadata] = None
        self.single_class_prior: Optional[float] = None
        self.training_period: str = "N/A"
        self.validation_period: str = "N/A"

    def _sigmoid(self, z: np.ndarray) -> np.ndarray:
        # Numerically stable sigmoid
        z_clipped = np.clip(z, -30.0, 30.0)
        return 1.0 / (1.0 + np.exp(-z_clipped))

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

            # Impute missing values with training mean
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
                # Missing column in inference: use 0.0 (standardized mean)
                X_norm[:, j] = 0.0

        return X_norm

    def fit(
        self,
        X_df: pd.DataFrame,
        y: pd.Series,
        training_period: str = "N/A"
    ) -> "BaselineLogisticModel":
        self.training_period = training_period
        y_arr = y.to_numpy(dtype=float)

        # Check for single-class corner case
        unique_classes = np.unique(y_arr[~np.isnan(y_arr)])
        if len(unique_classes) <= 1:
            self.single_class_prior = float(np.mean(y_arr)) if len(y_arr) > 0 else 0.0
            self.weights = np.zeros(X_df.shape[1])
            self.intercept = 0.0
            _, self.preprocessing = self.fit_preprocessing(X_df)
            return self

        X_norm, _ = self.fit_preprocessing(X_df)
        n_samples, n_features = X_norm.shape

        self.weights = np.zeros(n_features)
        self.intercept = 0.0

        # Gradient descent with L2 regularization
        for _ in range(self.max_iter):
            linear_model = np.dot(X_norm, self.weights) + self.intercept
            y_pred = self._sigmoid(linear_model)

            # Gradients
            dw = (1.0 / n_samples) * np.dot(X_norm.T, (y_pred - y_arr)) + (self.l2_penalty * self.weights)
            db = (1.0 / n_samples) * np.sum(y_pred - y_arr)

            self.weights -= self.learning_rate * dw
            self.intercept -= self.learning_rate * db

        return self

    def predict_proba(self, X_df: pd.DataFrame) -> np.ndarray:
        if self.preprocessing is None or self.weights is None:
            raise ValueError("Model is not fitted.")

        if self.single_class_prior is not None:
            return np.full(len(X_df), self.single_class_prior, dtype=float)

        X_norm = self.transform(X_df)
        z = np.dot(X_norm, self.weights) + self.intercept
        return self._sigmoid(z)

    def predict(self, X_df: pd.DataFrame, threshold: float = 0.5) -> np.ndarray:
        probas = self.predict_proba(X_df)
        return (probas >= threshold).astype(int)

    def get_metadata(self) -> ModelMetadata:
        coeffs = {}
        if self.weights is not None:
            for feat, w in zip(self.feature_names, self.weights):
                coeffs[feat] = float(round(w, 4))

        return ModelMetadata(
            model_id=f"logistic_baseline_{self.target_name}_{self.horizon_days}d",
            model_type="LOGISTIC_REGRESSION_BASELINE",
            target_name=self.target_name,
            horizon_days=self.horizon_days,
            training_period=self.training_period,
            validation_period=self.validation_period,
            feature_names=self.feature_names,
            hyperparameters={
                "learning_rate": self.learning_rate,
                "max_iter": self.max_iter,
                "l2_penalty": self.l2_penalty
            },
            fitted_at=datetime.utcnow().isoformat(),
            preprocessing=self.preprocessing or PreprocessingMetadata(
                feature_names=[], feature_means={}, feature_stds={}, imputed_defaults={}, training_sample_count=0
            ),
            coefficients=coeffs,
            intercept=float(round(self.intercept, 4)),
            scientific_status="BASELINE_TRAINED"
        )
