const { Router } = require("express");
const { protect, authorize } = require("../middleware/auth");
const dashboardController = require("../controllers/dashboard.controller");

const router = Router();

router.get("/summary", protect, authorize("ADMIN", "AUTHORITY", "FIELD_OFFICER"), dashboardController.getSummary);

module.exports = router;