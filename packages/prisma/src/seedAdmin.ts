import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// All available permissions
const ALL_PERMISSIONS = [
  'view_properties',
  'edit_properties',
  'delete_properties',
  'verify_properties',
  'view_users',
  'manage_users',
  'delete_users',
  'view_owners',
  'manage_owners',
  'update_owner_plans',
  'delete_owners',
  'manage_admins',
  'assign_tasks',
  'view_activity_logs',
  'view_analytics',
  'full_access',
];

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin seed...\n');

    // Check if main admin already exists
    const existingMainAdmin = await prisma.admin.findFirst({
      where: { role: 'MAIN_ADMIN' },
    });

    if (existingMainAdmin) {
      console.log('✅ Main admin already exists');
      console.log('═══════════════════════════════════════');
      console.log('📧 Email:', existingMainAdmin.email);
      console.log('👤 Role:', existingMainAdmin.role);
      console.log('═══════════════════════════════════════\n');
    } else {
      // Create main admin with all permissions
      const hashedPassword = await bcrypt.hash('Admin@123', 10);

      const mainAdmin = await prisma.admin.create({
        data: {
          email: 'admin@roomkarts.com',
          password: hashedPassword,
          firstName: 'Main',
          lastName: 'Admin',
          phone: '+919719507080',
          role: 'MAIN_ADMIN',
          permissions: ALL_PERMISSIONS,
          isActive: true,
        },
      });

      console.log('✅ Main Admin created successfully!');
      console.log('═══════════════════════════════════════');
      console.log('📧 Email:', mainAdmin.email);
      console.log('🔑 Password: Admin@123');
      console.log('👤 Role:', mainAdmin.role);
      console.log('🔐 Permissions: ALL (Full Access)');
      console.log('═══════════════════════════════════════\n');
    }

    // Check if employee admin exists
    const existingEmployee = await prisma.admin.findFirst({
      where: { email: 'employee@roomkarts.com' },
    });

    if (existingEmployee) {
      console.log('✅ Employee admin already exists');
      console.log('═══════════════════════════════════════');
      console.log('📧 Email:', existingEmployee.email);
      console.log('👤 Role:', existingEmployee.role);
      console.log('═══════════════════════════════════════\n');
    } else {
      // Create employee admin with limited permissions
      const hashedPasswordEmployee = await bcrypt.hash('Employee@123', 10);

      const employee = await prisma.admin.create({
        data: {
          email: 'employee@roomsdekho.com',
          password: hashedPasswordEmployee,
          firstName: 'Employee',
          lastName: 'Admin',
          phone: '+919999999998',
          role: 'EMPLOYEE',
          permissions: ['view_properties', 'view_users', 'view_owners'], // Limited permissions initially
          isActive: true,
        },
      });

      console.log('✅ Employee Admin created successfully!');
      console.log('═══════════════════════════════════════');
      console.log('📧 Email:', employee.email);
      console.log('🔑 Password: Employee@123');
      console.log('👤 Role:', employee.role);
      console.log('🔐 Permissions: View Only (view_properties, view_users, view_owners)');
      console.log('═══════════════════════════════════════\n');
    }

    console.log('\n🎉 Admin seed completed successfully!');
    console.log('⚠️  Important: Please change default passwords after first login!\n');
    console.log('📝 Quick Start:');
    console.log('   1. Start admin server: cd apps/admin-server && npm run dev');
    console.log('   2. Start admin web: cd apps/admin-web && npm run dev');
    console.log('   3. Login at: http://localhost:4000\n');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
