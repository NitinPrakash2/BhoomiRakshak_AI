const config = require("../config");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/ml/predict (Section 23 / 61)
// Proxies to the FastAPI ML service. If the ML service is unavailable,
// we return a clear 503 with the exact reason (Section 45) instead of
// fabricating a prediction.
exports.predict = asyncHandler(async (req, res) => {
  const features = req.body || {};
  if (!features || Object.keys(features).length === 0) {
    throw new ApiError(400, "Prediction features are required.");
  }

  let mlUrl = config.services.mlServiceUrl;
  if (!mlUrl) throw new ApiError(503, "ML_SERVICE_URL is not configured.");

  try {
    const upstream = await fetch(`${mlUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(features),
    });
    if (!upstream.ok) {
      const txt = await upstream.text();
      throw new Error(`ML service error ${upstream.status}: ${txt}`);
    }
    const parsed = await upstream.json();
    // FastAPI returns { success, data: {riskScore,...} }; surface the
    // prediction object cleanly so the frontend contract (Section 23) is flat.
    res.json({ success: true, data: parsed.data ?? parsed });
  } catch (err) {
    // Section 45: never silently fabricate a prediction when upstream fails.
    throw new ApiError(503, `ML inference unavailable: ${err.message}`);
  }
});

module.exports = exports;