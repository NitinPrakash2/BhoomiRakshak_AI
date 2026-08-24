const { Router } = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const { audit } = require("../middleware/audit");
const reportController = require("../controllers/report.controller");

const router = Router();

router.post(
  "/",
  protect,
  [
    body("latitude").isFloat({ min: -90, max: 90 }).toFloat(),
    body("longitude").isFloat({ min: -180, max: 180 }).toFloat(),
    body("incidentType").isIn(["CRACK", "SLOPE_MOVEMENT", "ROCKFALL", "MUD_DEBRIS", "ROAD_BLOCKAGE", "WATER_OVERFLOW", "OTHER"]),
    validate,
  ],
  audit("REPORT_CREATE"),
  reportController.createReport
);

router.get("/", reportController.listReports);
router.get("/:id", reportController.getReportById);

router.patch(
  "/:id/status",
  protect,
  authorize("FIELD_OFFICER", "AUTHORITY", "ADMIN"),
  audit("REPORT_STATUS_UPDATE"),
  reportController.updateReportStatus
);

module.exports = router;