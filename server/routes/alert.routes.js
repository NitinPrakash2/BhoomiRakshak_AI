const { Router } = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const { audit } = require("../middleware/audit");
const alertController = require("../controllers/alert.controller");

const router = Router();

router.get("/", alertController.listAlerts);

router.post(
  "/",
  protect,
  authorize("ADMIN", "AUTHORITY"),
  [body("title").trim().notEmpty().withMessage("title is required."), validate],
  audit("ALERT_CREATE"),
  alertController.createAlert
);

router.patch(
  "/:id/acknowledge",
  protect,
  authorize("ADMIN", "AUTHORITY", "FIELD_OFFICER"),
  audit("ALERT_ACKNOWLEDGE"),
  alertController.acknowledgeAlert
);

module.exports = router;