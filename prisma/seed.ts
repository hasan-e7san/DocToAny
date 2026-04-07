import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminName = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!adminEmail || !adminPassword) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        name: adminName,
        passwordHash,
      },
    });
    console.log(`Updated admin user: ${adminEmail}`);
    return;
  }

  await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      triesLimit: 5,
      triesUsed: 0,
    },
  });

  console.log(`Created admin user: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
