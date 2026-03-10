// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@gorontalounite.com" },
    update: {},
    create: {
      email: "admin@gorontalounite.com",
      name: "Admin Gorontalo Unite",
      password,
      role: "ADMIN",
    },
  });

  console.log("✅ Seed complete. Login: admin@gorontalounite.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
