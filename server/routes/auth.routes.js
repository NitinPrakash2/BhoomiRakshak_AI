const { Router } = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const authController = require("../controllers/auth.controller");

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("role").optional().isIn(["ADMIN", "AUTHORITY", "FIELD_OFFICER", "CITIZEN"]),
    validate,
  ],
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
    validate,
  ],
  authController.login
);

router.get("/me", protect, authController.getMe);

module.exports = router;