const prisma = require("../prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/sensors -> latest reading per sensor id
exports.getSensors = asyncHandler(async (req, res) => {
  const sensors = await prisma.sensorData.findMany({
    orderBy: { recordedAt: "desc" },
    take: 500,
  });
  const latest = new Map();
  for (const s of sensors) {
    if (!latest.has(s.sensorId)) latest.set(s.sensorId, s);
  }
  res.json({ success: true, count: latest.size, data: Array.from(latest.values()) });
});

// GET /api/sensors/:id -> history for a sensor
exports.getSensorById = asyncHandler(async (req, res) => {
  const rows = await prisma.sensorData.findMany({
    where: { sensorId: req.params.id },
    orderBy: { recordedAt: "desc" },
    take: 100,
  });
  res.json({ success: true, sensorId: req.params.id, count: rows.length, data: rows });
});

// POST /api/sensors/data -> ingest a reading (labelled SIMULATED unless LIVE is asserted)
exports.createSensorData = asyncHandler(async (req, res) => {
  const { sensorId, latitude, longitude, soilMoisture, temperature, dataQuality } = req.body;
  if (!sensorId || latitude == null || longitude == null) {
    throw new ApiError(400, "sensorId, latitude, longitude are required.");
  }
  const q = ["LIVE", "HISTORICAL", "SIMULATED", "DEMO"].includes(dataQuality) ? dataQuality : "SIMULATED";
  const row = await prisma.sensorData.create({
    data: {
      sensorId,
      latitude,
      longitude,
      soilMoisture: soilMoisture ?? null,
      temperature: temperature ?? null,
      dataQuality: q,
      recordedAt: new Date(),
    },
  });
  res.status(201).json({ success: true, data: row });
});

module.exports = exports;