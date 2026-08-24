const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,
  jwt: {
    secret: process.env.JWT_SECRET || "dev_secret_change_me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  services: {
    mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
    weatherApiUrl: process.env.WEATHER_API_URL || "https://api.open-meteo.com/v1/forecast",
  },
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || "admin@bhoomirakshak.gov.in",
    adminPassword: process.env.SEED_ADMIN_PASSWORD || "Admin@123",
  },
};

module.exports = config;
