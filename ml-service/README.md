# BhoomiRakshak ML Service

Python/FastAPI landslide risk inference service. Aligned with
`MASTER_DOCUMENTATION.md` (Sections 14-23, 47 P5/P6, 61).

## Layout

```
data/            dataset generator + dataset.csv (demo-calibrated)
preprocessing/   allowlisted feature schema + risk calibration
training/        compare LR/RF/XGBoost, time-aware split, save artifacts
inference/       model loader + prediction + explanation (SHAP/linear)
evaluation/      (reserved) evaluation helpers
models/          model.joblib + model_meta.json (generated)
main.py          FastAPI app: /health, /model-info, /predict
```

## Run

```bash
# 1) generate the (demo-calibrated) dataset
python -m data.make_dataset

# 2) train and compare models; saves models/model.joblib + metadata
python -m training.train

# 3) serve
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## Honesty note (Sections 9 / 44)

The dataset is **DEMO-CALIBRATED** (labelled `SIMULATED`) for the prototype
demo. It is NOT a validated real-world dataset, so the model must not be
presented as having validated field accuracy. `/model-info` exposes this
provenance explicitly. Predictions therefore power a **decision-support
estimate**, never a guaranteed landslide prediction.