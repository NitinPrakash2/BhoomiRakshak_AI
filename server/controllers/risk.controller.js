const prisma = require("../prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Helper: extract [lng, lat] from a GeoJSON geometry (Section 27 / 11).
const centroidOf = (geometry) => {
  if (!geometry) return null;
  if (geometry.type === "Point") {
    const [lng, lat] = geometry.coordinates;
    return { lng, lat };
  }
  if (geometry.type === "Polygon" && geometry.coordinates?.[0]?.[0]) {
    let lng = 0;
    let lat = 0;
    const ring = geometry.coordinates[0];
    for (const [x, y] of ring) {
      lng += x;
      lat += y;
    }
    lng /= ring.length;
    lat /= ring.length;
    return { lng, lat };
  }
  return null;
};

exports.getZones = asyncHandler(async (req, res) => {
  const { state, district, level } = req.query;
  const where = {};
  if (state) where.state = state;
  if (district) where.district = district;
  if (level) where.riskLevel = level;

  const zones = await prisma.riskZone.findMany({
    where,
    orderBy: { riskScore: "desc" },
  });
  res.json({ success: true, count: zones.length, data: zones });
});

exports.getZoneById = asyncHandler(async (req, res) => {
  const zone = await prisma.riskZone.findUnique({ where: { id: req.params.id } });
  if (!zone) throw new ApiError(404, "Risk zone not found.");
  res.json({ success: true, data: zone });
});

// Lightweight GeoJSON points for layer rendering (Section 11 map layers).
exports.getHeatmap = asyncHandler(async (req, res) => {
  const zones = await prisma.riskZone.findMany();
  const features = zones
    .filter((z) => centroidOf(z.geometry))
    .map((z) => {
      const c = centroidOf(z.geometry);
      return {
        type: "Feature",
        properties: {
          id: z.id,
          name: z.name,
          district: z.district,
          state: z.state,
          riskScore: z.riskScore,
          riskLevel: z.riskLevel,
          dataQuality: z.dataQuality,
        },
        geometry: { type: "Point", coordinates: [c.lng, c.lat] },
      };
    });
  res.json({ success: true, type: "FeatureCollection", features });
});

// Risk trend over the last N hours per zone (Section 9 of doc / predictions table).
exports.getTrends = asyncHandler(async (req, res) => {
  const hours = Math.min(parseInt(req.query.hours, 10) || 24, 24 * 7);
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const zones = await prisma.riskZone.findMany({
    include: {
      predictions: {
        where: { predictionTime: { gte: since } },
        orderBy: { predictionTime: "asc" },
        take: 48,
      },
    },
  });

  const series = zones.map((z) => ({
    id: z.id,
    name: z.name,
    district: z.district,
    points: z.predictions.map((p) => ({
      time: p.predictionTime,
      riskScore: p.riskScore,
      riskLevel: p.riskLevel,
    })),
  }));

  res.json({ success: true, hours, data: series });
});

module.exports = exports;