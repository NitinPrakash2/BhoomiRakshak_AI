const prisma = require("../prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/roads -> list roads (optionally by ?status=)
exports.listRoads = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  const roads = await prisma.road.findMany({ where, orderBy: { name: "asc" } });
  res.json({ success: true, count: roads.length, data: roads });
});

// PATCH /api/roads/:id/status -> field officer updates road status (Section 32)
exports.updateRoadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const valid = ["OPEN", "AT_RISK", "BLOCKED", "PARTIALLY_BLOCKED", "UNKNOWN"];
  if (!status || !valid.includes(status)) {
    throw new ApiError(400, "status must be one of: " + valid.join(", "));
  }
  const road = await prisma.road.findUnique({ where: { id: req.params.id } });
  if (!road) throw new ApiError(404, "Road not found.");
  const updated = await prisma.road.update({
    where: { id: road.id },
    data: { status, lastUpdated: new Date() },
  });
  res.json({ success: true, data: updated });
});

module.exports = exports;