const { Router } = require("express");
const riskController = require("../controllers/risk.controller");
const { protect } = require("../middleware/auth");

const router = Router();

// Public read endpoints for dashboard/map rendering.
router.get("/zones", riskController.getZones);
router.get("/zones/:id", riskController.getZoneById);
router.get("/heatmap", riskController.getHeatmap);
router.get("/trends", riskController.getTrends);

module.exports = router;