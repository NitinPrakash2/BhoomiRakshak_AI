const prisma = require("../prisma");

/**
 * Audit middleware: records a structured action in the audit_logs table
 * (MASTER_DOCUMENTATION.md Section 41 / 54 - audit logs + observability).
 *
 * Usage:  router.post("/x", protect, audit("REPORT_CREATE"), controller.fn)
 */
const audit = (action, resource) => async (req, res, next) => {
  res.on("finish", async () => {
    try {
      const user = req.user && req.user.id ? { id: req.user.id } : null;
      await prisma.auditLog.create({
        data: {
          userId: user ? user.id : null,
          action,
          resource: resource || req.baseUrl || null,
          resourceId: req.params.id || null,
          ipAddress: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null,
          details: {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
          },
        },
      });
    } catch (err) {
      // Audit logging must never break the request flow (Section 54).
      // no-op: observability is best-effort.
    }
  });
  next();
};

module.exports = { audit };