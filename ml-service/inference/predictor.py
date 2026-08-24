"""Load the trained model + metadata for inference.

Aligned with MASTER_DOCUMENTATION.md Section 47 P6 / Section 53 (versioning).
"""
import os
import json
from datetime import datetime, timezone

import joblib
import numpy as np

from preprocessing.features import FEATURES, probability_to_risk

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "model.joblib")
META_PATH = os.path.join(MODEL_DIR, "model_meta.json")

_model = None
_meta = None


def load_model():
    global _model, _meta
    if _model is not None:
        return _model, _meta
    if not os.path.exists(MODEL_PATH) or not os.path.exists(META_PATH):
        raise FileNotFoundError(
            "Trained model artifact not found. Run: python -m training.train"
        )
    _model = joblib.load(MODEL_PATH)
    with open(META_PATH) as f:
        _meta = json.load(f)
    return _model, _meta


def to_feature_vector(payload: dict) -> np.ndarray:
    """Build a feature row in the exact allowlisted FEATURES order (Section 16)."""
    row = []
    for feat in FEATURES:
        val = payload.get(feat)
        if val is None or (isinstance(val, float) and np.isnan(val)):
            raise ValueError(f"Missing or invalid feature: {feat}")
        row.append(float(val))
    return np.array([row])


def explain(model, X_row) -> list:
    """Produce top contributing factors (SHAP where possible, else weighted).

    Section 21: every high-risk prediction must explain WHY. For tree models
    SHAP is ideal; for a scaled logistic pipeline we use a linear (SHAP
    LinearExplainer) weighting consistent with the model coefficients.
    """
    try:
        import shap  # lazy import keeps boot fast when unused
        # Pipeline: final step is the classifier with coef_ (linear model)
        clf = model.named_steps["clf"] if hasattr(model, "named_steps") else model
        if hasattr(clf, "coef_"):
            scaled = model.named_steps["scale"].transform(X_row) if hasattr(model, "named_steps") else X_row
            # Linear contribution = coef * scaled feature (a SHAP-equivalent).
            contrib = (clf.coef_[0] * scaled[0])
            order = np.argsort(-np.abs(contrib))[:5]
            return [
                {
                    "feature": FEATURES[i],
                    "direction": "increases_risk" if contrib[i] > 0 else "decreases_risk",
                    "weight": round(float(abs(contrib[i])), 4),
                }
                for i in order
            ]
        # Fallback for tree models: per-sample SHAP values.
        bow = shap.TreeExplainer(clf)
        vals = bow.shap_values(X_row)
        order = np.argsort(-np.abs(vals[0] if isinstance(vals, list) else vals))[:5]
        return [{"feature": FEATURES[i], "weight": round(abs(float((vals[0] if isinstance(vals, list) else vals)[i])), 4)} for i in order]
    except Exception:
        # Last-resort fallback: raw coefficient magnitude for linear models.
        clf = model.named_steps["clf"] if hasattr(model, "named_steps") else model
        if hasattr(clf, "coef_"):
            order = np.argsort(-np.abs(clf.coef_[0]))[:5]
            return [{"feature": FEATURES[i], "weight": round(abs(float(clf.coef_[0][i])), 4)} for i in order]
        return []


def predict(payload: dict) -> dict:
    model, meta = load_model()
    X = to_feature_vector(payload)

    proba = float(model.predict_proba(X)[0, 1])
    risk = probability_to_risk(proba)

    return {
        "riskScore": risk["riskScore"],
        "riskLevel": risk["riskLevel"],
        "modelProbability": round(proba, 4),
        "topFactors": explain(model, X),
        "modelVersion": meta.get("model_version", "unknown"),
        "featureVersion": meta.get("feature_version", "unknown"),
        "dataQuality": meta.get("data_quality", "SIMULATED"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }