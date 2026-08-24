const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const config = require("../config");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const prisma = new PrismaClient();

const generateToken = (userId) => {
  return jwt.sign({ sub: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const sanitizeUser = (user) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, name, role, phone, district, state } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "Email already registered.");
  }

  const allowedRole = role && ["ADMIN", "AUTHORITY", "FIELD_OFFICER"].includes(role)
    ? role
    : "CITIZEN";

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: allowedRole,
      phone,
      district,
      state,
    },
  });

  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    data: { user: sanitizeUser(user), token },
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated.");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = generateToken(user.id);

  res.json({
    success: true,
    data: { user: sanitizeUser(user), token },
  });
});

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      district: true,
      state: true,
      isActive: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
});