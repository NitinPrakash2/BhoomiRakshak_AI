const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const config = require("../config");

const prisma = new PrismaClient();

async function seed() {
  const adminEmail = config.seed.adminEmail;
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log(`[seed] Admin user already exists: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(config.seed.adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "System Admin",
        role: "ADMIN",
        state: "All",
        district: "All",
      },
    });
    console.log(`[seed] Admin user created: ${adminEmail}`);
  }

  console.log("[seed] Complete.");
}

seed()
  .catch((e) => {
    console.error("[seed] Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());