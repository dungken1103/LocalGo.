import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('123456', 10);
  const adminPassword = await bcrypt.hash('123123', 10);

  // ========== ADMIN ==========
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      slug: 'admin-user',
    },
  });

  // ========== USER 1 ==========
  await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      passwordHash: hashedPassword,
      name: 'Alice User',
      role: Role.RENTER,
      slug: 'alice-user',
    },
  });

  // ========== USER 2 ==========
  await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      passwordHash: hashedPassword,
      name: 'Bob User',
      role: Role.RENTER,
      slug: 'bob-user',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
