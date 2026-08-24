const { Router } = require("express");
const sensorController = require("../controllers/sensor.controller");
const { protect } = require("../middleware/auth");

const router = Router();

router.get("/", sensorController.getSensors);
router.get("/:id", sensorController.getSensorById);
router.post("/data", protect, sensorController.createSensorData);

module.exports = router;