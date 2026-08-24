const { Router } = require("express");
const authRoutes = require("./auth.routes");
const riskRoutes = require("./risk.routes");
const weatherRoutes = require("./weather.routes");
const sensorRoutes = require("./sensor.routes");
const reportRoutes = require("./report.routes");
const alertRoutes = require("./alert.routes");
const roadRoutes = require("./road.routes");
const dashboardRoutes = require("./dashboard.routes");
const mlRoutes = require("./ml.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/risk", riskRoutes);
router.use("/weather", weatherRoutes);
router.use("/sensors", sensorRoutes);
router.use("/reports", reportRoutes);
router.use("/alerts", alertRoutes);
router.use("/roads", roadRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/ml", mlRoutes);

module.exports = router;