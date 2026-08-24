const prisma = require("../prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/alerts -> list alerts (optionally by ?level=)
exports.listAlerts = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.level) where.alertLevel = req.query.level;
  const alerts = await prisma.alert.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { riskZone: { select: { id: true, name: true, district: true, state: true } } },
  });
  res.json({ success: true, count: alerts.length, data: alerts });
});

// POST /api/alerts -> create an alert (ADMIN/AUTHORITY)
exports.createAlert = asyncHandler(async (req, res) => {
  const { riskZoneId, riskScore, riskLevel, alertLevel, title, message, contributingFactors, affectedRoad, affectedVillage, recommendedAction } = req.body;
  if (!riskZoneId || !title) throw new ApiError(400, "riskZoneId and title are required.");
  const zone = await prisma.riskZone.findUnique({ where: { id: riskZoneId } });
  if (!zone) throw new ApiError(404, "Risk zone not found.");

  const alert = await prisma.alert.create({
    data: {
      riskZoneId,
      riskScore: riskScore ?? zone.riskScore ?? 0,
      riskLevel: riskLevel ?? zone.riskLevel ?? "MODERATE",
      alertLevel: alertLevel || "WATCH",
      title,
      message: message || null,
      contributingFactors: contributingFactors || null,
      affectedRoad: affectedRoad || null,
      affectedVillage: affectedVillage || null,
      recommendedAction: recommendedAction || null,
    },
  });
  res.status(201).json({ success: true, data: alert });
});

// PATCH /api/alerts/:id/acknowledge
exports.acknowledgeAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) throw new ApiError(404, "Alert not found.");
  if (alert.acknowledged) throw new ApiError(409, "Alert already acknowledged.");

  const updated = await prisma.alert.update({
    where: { id },
    data: { acknowledged: true, acknowledgedBy: req.user?.name || null, acknowledgedAt: new Date() },
  });
  res.json({ success: true, data: updated });
});

module.exports = exports;