const prisma = require("../prisma");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/dashboard/summary (Section 33)
exports.getSummary = asyncHandler(async (req, res) => {
  const activeAlerts = await prisma.alert.count({ where: { acknowledged: false } });
  const alerts = await prisma.alert.count();
  const highRisk = await prisma.riskZone.count({ where: { riskLevel: "HIGH" } });
  const veryHighRisk = await prisma.riskZone.count({ where: { riskLevel: "VERY_HIGH" } });
  const blocked = await prisma.road.count({ where: { status: "BLOCKED" } });
  const atRiskRoads = await prisma.road.count({ where: { status: "AT_RISK" } });
  const fieldReports = await prisma.fieldReport.count();
  const sensors = await prisma.sensorData.findMany({ orderBy: { recordedAt: "desc" }, take: 500 });
  const sensorIds = new Set(sensors.map((s) => s.sensorId));
  const sensorsOnline = sensorIds.size;
  const zones = await prisma.riskZone.count();

  // Sort zones by risk for the priority queue (Section 31: risk-aware ordering).
  const riskyZones = await prisma.riskZone.findMany({
    where: { riskScore: { not: null } },
    orderBy: { riskScore: "desc" },
    take: 10,
  });

  res.json({
    success: true,
    data: {
      stats: {
        activeAlerts,
        alerts,
        highRiskZones: highRisk,
        veryHighRiskZones: veryHighRisk,
        blockedRoads: blocked,
        atRiskRoads,
        fieldReports,
        sensorsOnline,
        totalRiskZones: zones,
      },
      priorityQueue: riskyZones.map((z) => ({
        id: z.id,
        name: z.name,
        district: z.district,
        state: z.state,
        riskScore: z.riskScore,
        riskLevel: z.riskLevel,
        dataQuality: z.dataQuality,
      })),
      generatedAt: new Date().toISOString(),
    },
  });
});

module.exports = exports;