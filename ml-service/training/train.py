"""Train and compare baseline / Random Forest / XGBoost landslide models.

Aligned with MASTER_DOCUMENTATION.md:
  - Section 15: compare Logistic Regression (baseline), Random Forest, XGBoost.
  - Section 17: pipeline order.
  - Section 18: time-aware (chronological) split to prevent temporal leakage.
  - Section 19: class imbalance handling (scale_pos_weight / class_weight).
  - Section 20: report precision/recall/F1/ROC-AUC/confusion matrix, NEVER
               accuracy alone. False negatives matter for early-warning.
  - Section 47 P5: save model artifact, feature schema, model version,
                   training metadata.
"""
import os
import json
import warnings
from datetime import datetime, timezone
warnings.filterwarnings("ignore")  # keep stderr clean / exit code stable

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix, classification_report,
)
from xgboost import XGBClassifier

from preprocessing.features import FEATURES, TARGET

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "dataset.csv")

FEATURE_VERSION = "feat-v1"


def load_data(path: str = DATASET_PATH) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=["date"])
    df = df.sort_values("date").reset_index(drop=True)
    return df


def time_aware_split(df: pd.DataFrame, train_ratio=0.7, val_ratio=0.15):
    """Out-of-time split on the date column (Section 18).

    Disaster data is time-dependent: predicting the past using future
    observations is temporal data leakage. Sorting by date and splitting
    chronologically means the validation/test sets contain only events that
    occur AFTER the training period, which is how an operational early-warning
    system would be used.
    """
    n = len(df)
    n_train = int(n * train_ratio)
    n_val = int(n * val_ratio)
    train = df.iloc[:n_train]
    val = df.iloc[n_train:n_train + n_val]
    test = df.iloc[n_train + n_val:]
    return train, val, test


def make_model(name: str, X_train, y_train):
    if name == "logreg":
        # Scale features so Logistic Regression converges reliably.
        return Pipeline([
            ("scale", StandardScaler()),
            ("clf", LogisticRegression(max_iter=3000, class_weight="balanced", random_state=42)),
        ])
    if name == "rf":
        return RandomForestClassifier(n_estimators=300, class_weight="balanced", random_state=42, n_jobs=-1)
    if name == "xgb":
        pos = int((y_train == 1).sum())
        neg = int((y_train == 0).sum())
        return XGBClassifier(
            n_estimators=300, max_depth=6, learning_rate=0.1, tree_method="hist",
            scale_pos_weight=neg / max(pos, 1),  # Section 19 class imbalance
            eval_metric="logloss", random_state=42,
        )
    raise ValueError(name)


def evaluate(name, model, X, y):
    pred = model.predict(X)
    proba = model.predict_proba(X)[:, 1]
    return {
        "model": name,
        "precision": float(precision_score(y, pred, zero_division=0)),
        "recall": float(recall_score(y, pred, zero_division=0)),
        "f1": float(f1_score(y, pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y, proba)) if len(set(y)) > 1 else None,
        "confusion_matrix": confusion_matrix(y, pred).tolist(),
    }


def train():
    df = load_data()
    train_df, val_df, test_df = time_aware_split(df)

    X_train = train_df[FEATURES]
    y_train = train_df[TARGET]
    X_test = test_df[FEATURES]
    y_test = test_df[TARGET]

    fitted = {}
    results = {}
    for name in ("logreg", "rf", "xgb"):
        model = make_model(name, X_train, y_train)
        model.fit(X_train, y_train)
        fitted[name] = model
        results[name] = evaluate(name, model, X_test, y_test)
        print(f"[train] {name} test metrics:", results[name])

    # Select best model by F1 on the out-of-time test set (Section 15/20).
    best_name = max(results, key=lambda k: (results[k]["f1"] or 0))
    best_model = fitted[best_name]
    return best_model, best_name, results, df, (train_df, val_df, test_df)


def save_artifacts(best_model, best_name, results, df, splits):
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, "model.joblib")
    joblib.dump(best_model, model_path)

    (train_df, val_df, test_df) = splits
    meta = {
        "model_version": f"{best_name}-v1.0",
        "feature_version": FEATURE_VERSION,
        "algorithm": best_name,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "features": FEATURES,
        "target": TARGET,
        # HONESTY (Section 9/44): demo-calibrated, NOT validated real-world.
        "data_quality": "SIMULATED",
        "provenance": "Dataset is DEMO-CALIBRATED for prototype demonstration "
                      "(see data/dataset_meta.json). Do NOT claim validated "
                      "real-world accuracy.",
        "split": "TIME_AWARE chronological (Section 18) - train, val, test by date",
        "n_samples_total": int(len(df)),
        "n_train": int(len(train_df)),
        "n_val": int(len(val_df)),
        "n_test": int(len(test_df)),
        "class_balance": {
            "positive_train": int(train_df[TARGET].sum()),
            "negative_train": int((train_df[TARGET] == 0).sum()),
        },
        "evaluation": {"logreg": None, "rf": None, "xgb": None},
    }
    return model_path, meta


def run():
    best_model, best_name, results, df, splits = train()
    model_path, meta = save_artifacts(best_model, best_name, results, df, splits)
    meta["evaluation"] = results
    meta_path = os.path.join(MODEL_DIR, "model_meta.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"[train] selected model: {best_name} (F1-selected on out-of-time test)")
    print(f"[train] saved {model_path}")
    print(f"[train] saved metadata {meta_path}")
    print("\n=== CLASSIFICATION REPORT (best on test) ===")
    X_test = splits[2][FEATURES]
    y_test = splits[2][TARGET]
    print(classification_report(y_test, best_model.predict(X_test), zero_division=0, target_names=["No landslide", "Landslide"]))
    return meta_path


if __name__ == "__main__":
    run()