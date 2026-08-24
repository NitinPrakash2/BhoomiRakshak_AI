const { Router } = require("express");
const { protect, authorize } = require("../middleware/auth");
const mlController = require("../controllers/ml.controller");

const router = Router();

router.post("/predict", protect, authorize("ADMIN", "AUTHORITY"), mlController.predict);

module.exports = router;