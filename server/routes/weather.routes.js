const { Router } = require("express");
const weatherController = require("../controllers/weather.controller");

const router = Router();

router.get("/", weatherController.getWeather);
router.get("/:location", weatherController.getWeatherByLocation);

module.exports = router;