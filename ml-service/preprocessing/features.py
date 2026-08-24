"""Shared ML feature schema and risk calibration.

Aligned with MASTER_DOCUMENTATION.md:
  - Section 16: allowlisted ML input features (do not invent unsupported ones).
  - Section 12: initial risk thresholds (product thresholds, NOT universal).
  - Section 14: produce probability -> normalized risk score -> calibrated level.
  - Section 53: model versioning.
"""

# Allowlisted numeric features (Section 16). Order is important and must match
# the column order used during training/inference.
FEATURES = [
    "rainfall_1h",
    "rainfall_6h",
    "rainfall_24h",
    "rainfall_72h",
    "soil_moisture",
    "elevation",
    "slope",
    "aspect",
    "terrain_ruggedness",
    "historical_landslide_count",
    "distance_to_road",
    "distance_to_river",
    "geological_risk_indicator",
    "recent_surface_change",
]

# Binary target (Section 14): landslide_occurrence (1 = landslide, 0 = none)
TARGET = "landslide_occurrence"

# Initial product thresholds (Section 12). MUST NOT be represented as
# scientifically universal thresholds.
RISK_LEVELS = [
    ("LOW", 0, 25),
    ("MODERATE", 26, 50),
    ("HIGH", 51, 75),
    ("VERY_HIGH", 76, 100),
]


def probability_to_risk(prob: float) -> dict:
    """Convert model probability (0..1) into a 0-100 risk score + level.

    The mapping is monotonic so that higher predicted probability always maps
    to a higher risk score. Thresholds are the initial product thresholds.
    """
    prob = max(0.0, min(1.0, float(prob)))
    risk_score = int(round(prob * 100))
    level = "LOW"
    for name, lo, hi in RISK_LEVELS:
        if lo <= risk_score <= hi:
            level = name
            break
    return {"riskScore": risk_score, "riskLevel": level}