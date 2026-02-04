import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Main Admin with all permissions
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const mainAdmin = await prisma.admin.upsert({
    where: { email: 'admin@roomsdekho.com' },
    update: {},
    create: {
      email: 'admin@roomsdekho.com',
      password: hashedPassword,
      name: 'Main Admin',
      role: 'MAIN_ADMIN',
      permissions: [
        'VIEW_PROPERTIES',
        'EDIT_PROPERTIES',
        'DELETE_PROPERTIES',
        'VERIFY_PROPERTIES',
        'VIEW_USERS',
        'EDIT_USERS',
        'DELETE_USERS',
        'VIEW_OWNERS',
        'EDIT_OWNERS',
        'DELETE_OWNERS',
        'VIEW_ADMINS',
        'CREATE_ADMINS',
        'EDIT_ADMINS',
        'DELETE_ADMINS',
      ],
    },
  });

  console.log('✅ Main Admin created:', mainAdmin.email);

  // Create Employee Admin with limited permissions
  const employeeAdmin = await prisma.admin.upsert({
    where: { email: 'employee@roomsdekho.com' },
    update: {},
    create: {
      email: 'employee@roomsdekho.com',
      password: hashedPassword,
      name: 'Employee Admin',
      role: 'EMPLOYEE',
      permissions: [
        'VIEW_PROPERTIES',
        'VIEW_USERS',
        'VIEW_OWNERS',
      ],
      assignedById: mainAdmin.id,
    },
  });

  console.log('✅ Employee Admin created:', employeeAdmin.email);

  console.log('🎉 Seed completed successfully!');
  console.log('\nLogin credentials:');
  console.log('Main Admin:');
  console.log('  Email: admin@roomsdekho.com');
  console.log('  Password: admin123');
  console.log('\nEmployee Admin:');
  console.log('  Email: employee@roomsdekho.com');
  console.log('  Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
