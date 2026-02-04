import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedMainAdmin() {
  console.log('🌱 Seeding admin account...');

  // Check if main admin already exists
  const existingAdmin = await prisma.admin.findFirst({
    where: { role: 'MAIN_ADMIN' },
  });

  if (existingAdmin) {
    console.log('⚠️  Main admin already exists!');
    console.log('Email:', existingAdmin.email);
    return;
  }

  // Create main admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.admin.create({
    data: {
      email: 'admin@roomsdekho.com',
      password: hashedPassword,
      firstName: 'Main',
      lastName: 'Admin',
      phone: '9999999999',
      role: 'MAIN_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Main admin created successfully!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Password: admin123');
  console.log('⚠️  Please change the password after first login!');
}

seedMainAdmin()
  .catch((e) => {
    console.error('Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
