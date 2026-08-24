// Lightweight in-memory rate limiter (Section 41 security).
module.exports = (opts = {}) => {
  const windowMs = opts.windowMs || 60 * 1000;
  const max = opts.max || 120;
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || req.headers["x-forwarded-for"] || "unknown";
    const now = Date.now();
    const entry = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count += 1;
    hits.set(key, entry);

    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({
        success: false,
        error: { statusCode: 429, message: "Too many requests. Please try again shortly." },
      });
    }
    next();
  };
};