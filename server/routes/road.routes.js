const { Router } = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const { audit } = require("../middleware/audit");
const roadController = require("../controllers/road.controller");

const router = Router();

router.get("/", roadController.listRoads);

router.patch(
  "/:id/status",
  protect,
  authorize("FIELD_OFFICER", "AUTHORITY", "ADMIN"),
  [
    body("status").isIn(["OPEN", "AT_RISK", "BLOCKED", "PARTIALLY_BLOCKED", "UNKNOWN"]),
    validate,
  ],
  audit("ROAD_STATUS_UPDATE"),
  roadController.updateRoadStatus
);

module.exports = router;