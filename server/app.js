const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config");
const routes = require("./routes");
const rateLimit = require("./middleware/rateLimit");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (config.env !== "test") {
  app.use(morgan("dev"));
}

// Coarse global API rate limit (Section 41).
app.use("/api", rateLimit({ windowMs: 60_000, max: 300 }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "bhoomirakshak-server", time: new Date().toISOString() });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
