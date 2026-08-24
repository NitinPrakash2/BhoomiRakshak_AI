const prisma = require("../prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/reports -> create a geo-tagged field report (Section 28)
exports.createReport = asyncHandler(async (req, res) => {
  const {
    latitude,
    longitude,
    incidentType,
    description,
    photoUrl,
    roadStatus,
    syncStatus,
    dataQuality,
  } = req.body;

  if (latitude == null || longitude == null || !incidentType) {
    throw new ApiError(400, "latitude, longitude and incidentType are required.");
  }
  const validIncidents = ["CRACK", "SLOPE_MOVEMENT", "ROCKFALL", "MUD_DEBRIS", "ROAD_BLOCKAGE", "WATER_OVERFLOW", "OTHER"];
  if (!validIncidents.includes(incidentType)) {
    throw new ApiError(400, "incidentType must be one of: " + validIncidents.join(", "));
  }

  const report = await prisma.fieldReport.create({
    data: {
      userId: req.user.id,
      latitude,
      longitude,
      incidentType,
      description: description || null,
      photoUrl: photoUrl || null,
      roadStatus: roadStatus || null,
      syncStatus: syncStatus || "SYNCED",
      dataQuality: dataQuality || "LIVE",
      submittedAt: new Date(),
    },
  });
  res.status(201).json({ success: true, data: report });
});

// GET /api/reports -> list field reports (optionally by ?state=&limit=)
exports.listReports = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const reports = await prisma.fieldReport.findMany({
    orderBy: { submittedAt: "desc" },
    take: limit,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
  res.json({ success: true, count: reports.length, data: reports });
});

// GET /api/reports/:id
exports.getReportById = asyncHandler(async (req, res) => {
  const report = await prisma.fieldReport.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, name: true, role: true } } },
  });
  if (!report) throw new ApiError(404, "Field report not found.");
  res.json({ success: true, data: report });
});

// PATCH /api/reports/:id/status -> update road/incident status (field officer)
exports.updateReportStatus = asyncHandler(async (req, res) => {
  const { roadStatus, description, photoUrl } = req.body;
  const existing = await prisma.fieldReport.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Field report not found.");

  const update = {};
  if (roadStatus !== undefined) update.roadStatus = roadStatus;
  if (description !== undefined) update.description = description;
  if (photoUrl !== undefined) update.photoUrl = photoUrl;

  const updated = await prisma.fieldReport.update({ where: { id: existing.id }, data: update });
  res.json({ success: true, data: updated });
});

module.exports = exports;