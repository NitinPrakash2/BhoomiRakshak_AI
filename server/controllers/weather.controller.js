const prisma = require("../prisma");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/weather -> recent readings (optionally filtered by ?lat=&lng=)
exports.getWeather = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const where = {};
  if (lat) where.latitude = parseFloat(lat);
  if (lng) where.longitude = parseFloat(lng);

  const rows = await prisma.weatherData.findMany({
    where,
    orderBy: { recordedAt: "desc" },
    take: 50,
  });

  res.json({ success: true, count: rows.length, data: rows });
});

// GET /api/weather/:location -> latest reading for a named zone/district
exports.getWeatherByLocation = asyncHandler(async (req, res) => {
  const term = req.params.location;
  const zone = await prisma.riskZone.findFirst({ where: { district: { equals: term, mode: "insensitive" } } });

  const rows = await prisma.weatherData.findMany({
    orderBy: { recordedAt: "desc" },
    take: 200,
  });
  const filtered = zone ? rows.filter((w) => zoneGeometryMatches(zone, w)) : rows;
  const latest = filtered[0] || null;
  res.json({ success: true, location: term, data: latest });
});

function zoneGeometryMatches(zone, w) {
  const geom = zone.geometry;
  if (!geom) return false;
  const lngs = geom.coordinates?.[0]?.map((c) => c[0]) || [];
  const lats = geom.coordinates?.[0]?.map((c) => c[1]) || [];
  const minLng = Math.min(...lngs) - 0.01;
  const maxLng = Math.max(...lngs) + 0.01;
  const minLat = Math.min(...lats) - 0.01;
  const maxLat = Math.max(...lats) + 0.01;
  return w.longitude >= minLng && w.longitude <= maxLng && w.latitude >= minLat && w.latitude <= maxLat;
}

module.exports = exports;