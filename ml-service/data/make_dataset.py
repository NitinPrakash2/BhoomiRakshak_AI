"""Build a labelled training dataset for landslide risk.

HONESTY / PROVENANCE (MASTER_DOCUMENTATION.md Sections 9, 43, 44):
  This is a DEMO-CALIBRATED dataset for prototype demonstration. It is NOT a
  curated, ground-truthed field dataset, so the trained model MUST NOT claim
  validated real-world accuracy. That disclaimer is carried into the model
  metadata and /model-info.

  What makes it non-random:
    * Every sample is anchored to a REAL NER region (district, coordinates,
      elevation, terrain) from the project's geography table.
    * Landslide probability follows a documented physical rule: higher
      24h/72h rainfall, higher soil moisture, steeper slope, closer to
      roads/rivers, and more frequent historical events increase risk.
    * A chronological `date` field enables a time-aware (out-of-time) split to
      prevent temporal data leakage (Section 18).
"""
import os
from datetime import datetime, timedelta, timezone
import numpy as np
import pandas as pd

from preprocessing.features import FEATURES, TARGET

SEED = 42

# Real NER districts anchored to plausible terrain (mirrors seed-data.js).
# (name, state, district, lat, lon, base_elev, base_slope, base_soil, geol)
ZONES = [
    ("Mangan - North Sikkim Ridge", "Sikkim", "Mangan", 27.513, 88.534, 1950, 47, 90, 0.85),
    ("Gangtok - Chandmari Slope", "Sikkim", "Gangtok", 27.338, 88.606, 1437, 35, 79, 0.55),
    ("Tawang - Se La Pass Approach", "Arunachal Pradesh", "Tawang", 27.586, 91.859, 4100, 41, 84, 0.7),
    ("Pasighat - Rolling Flats", "Arunachal Pradesh", "East Siang", 28.066, 95.326, 153, 24, 71, 0.3),
    ("Shillong - Laitumkhrah", "Meghalaya", "East Khasi Hills", 25.578, 91.893, 1525, 28, 75, 0.5),
    ("Aizawl - New Capital Complex", "Mizoram", "Aizawl", 23.727, 92.718, 1132, 38, 82, 0.7),
    ("Lunglei - Zobawk", "Mizoram", "Lunglei", 22.884, 92.736, 1222, 31, 77, 0.6),
    ("Kohima - Japfu Ridge", "Nagaland", "Kohima", 25.665, 94.107, 1444, 34, 76, 0.65),
    ("Imphal East - Khuma", "Manipur", "Imphal East", 24.791, 93.943, 786, 18, 62, 0.25),
    ("Tamenglong - Hills", "Manipur", "Tamenglong", 24.998, 93.494, 1170, 26, 68, 0.4),
    ("Silchar - Cachar Slopes", "Assam", "Cachar", 24.834, 92.792, 66, 12, 66, 0.2),
    ("Agartala - Lembucherra", "Tripura", "West Tripura", 23.871, 91.287, 28, 10, 58, 0.15),
]


def _logistic(x):
    return 1.0 / (1.0 + np.exp(-x))


def generate(seed: int = 202607, samples_per_zone: int = 300) -> pd.DataFrame:
    """Generate a labelled, chronological sample set for each real zone."""
    rng = np.random.default_rng(seed)
    start = datetime(2024, 1, 1)
    rows = []

    for z in ZONES:
        name, state, district, lat, lng, elev, slope, soil, geol = z
        for _ in range(samples_per_zone):
            day_offset = int(rng.integers(0, 730))  # ~2 years of history
            date = start + timedelta(days=int(day_offset))
            month = date.month

            # seasonal rainfall: heavier in monsoon months (May-Sep)
            seasonal = 1.0 if 5 <= month <= 9 else 0.35
            rng_rain72 = rng.normal(60, 50) * seasonal
            rain72 = float(np.clip(rng_rain72, 0, 320))
            rain24 = float(np.clip(rain72 * rng.uniform(0.35, 0.6), 0, 180))
            rain6 = float(np.clip(rain24 * rng.uniform(0.25, 0.45), 0, 90))
            rain1 = float(np.clip(rain6 * rng.uniform(0.15, 0.4), 0, 50))

            soil_now = float(np.clip(soil + rain24 * 0.12 + rng.normal(0, 4), 20, 100))
            slope_now = float(np.clip(slope + rng.normal(0, 4), 0, 65))
            aspect = float(rng.uniform(0, 360))
            ruggedness = slope_now / 65.0

            dist_road = float(np.clip(rng.lognormal(mean=4.0, sigma=0.9) * (1.4 if slope_now > 30 else 1.0), 10, 5000))
            dist_river = float(np.clip(rng.lognormal(mean=4.7, sigma=1.0), 20, 8000))
            hist = int(max(0, rng.poisson(geol * 4)))
            geol_ind = float(np.clip(geol * (1.0 + rng.normal(0, 0.1)), 0, 1))
            surf_change = float(np.clip(rng.normal(0.2, 0.2) + (0.3 if rain24 > 90 else 0), 0, 1))

            # Documented physical rule -> risk probability (Section 9)
            lin = (
                -6.5
                + 2.0 * (rain24 / 120.0)
                + 2.3 * (rain72 / 200.0)
                + 1.8 * (soil_now / 100.0)
                + 2.1 * (slope_now / 55.0)
                + 1.9 * (hist / 4.0)
                - 0.9 * (dist_road / 2000.0)
                - 0.6 * (dist_river / 2000.0)
                + 1.4 * geol_ind
                + 0.8 * surf_change
            )
            p = _logistic(lin)
            label = int(rng.binomial(1, p))

            rows.append({
                "date": date.strftime("%Y-%m-%d"),
                "name": name,
                "state": state,
                "district": district,
                "latitude": lat,
                "longitude": lng,
                "elevation": elev,
                "rainfall_1h": round(rain1, 2),
                "rainfall_6h": round(rain6, 2),
                "rainfall_24h": round(rain24, 2),
                "rainfall_72h": round(rain72, 2),
                "soil_moisture": round(soil_now, 2),
                "slope": round(slope_now, 2),
                "aspect": round(aspect, 2),
                "terrain_ruggedness": round(ruggedness, 4),
                "historical_landslide_count": int(hist),
                "distance_to_road": round(dist_road, 2),
                "distance_to_river": round(dist_river, 2),
                "geological_risk_indicator": round(geol_ind, 4),
                "recent_surface_change": round(surf_change, 4),
                "landslide_occurrence": label,
            })

    df = pd.DataFrame(rows)
    df = df.sort_values("date").reset_index(drop=True)
    return df


def save_dataset(df: pd.DataFrame, out_path: str):
    import json
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    df.to_csv(out_path, index=False)
    meta = {
        "dataset": os.path.basename(out_path),
        "quality_label": "SIMULATED",
        "purpose": "Prototype demonstration pipeline - NOT a validated real-world dataset",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "samples": int(len(df)),
        "positive_class": int(df[TARGET].sum()),
        "negative_class": int((df[TARGET] == 0).sum()),
        "features": FEATURES,
        "target": TARGET,
        "seed": 202607,
    }
    meta_path = out_path.replace(".csv", "_meta.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)


if __name__ == "__main__":
    _out = os.path.join(os.path.dirname(__file__), "dataset.csv")
    _df = generate()
    save_dataset(_df, _out)
    print(f"Generated {len(_df)} rows -> {_out}")
    print(_df[TARGET].value_counts().to_string())