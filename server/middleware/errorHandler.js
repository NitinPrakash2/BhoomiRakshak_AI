const ApiError = require("../utils/ApiError");

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message, details } = err;

  if (!statusCode) {
    statusCode = 500;
    message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      statusCode,
      message,
      ...(details ? { details } : {}),
      ...(process.env.NODE_ENV === "development" && err.stack
        ? { stack: err.stack }
        : {}),
    },
  });
};

module.exports = { notFoundHandler, errorHandler };
