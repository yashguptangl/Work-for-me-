import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createMainAdmin() {
  try {
    // Check if main admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: { role: "MAIN_ADMIN" },
    });

    if (existingAdmin) {
      console.log("⚠️  Main admin already exists!");
      console.log(`Email: ${existingAdmin.email}`);
      return;
    }

    // Create main admin
    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    const admin = await prisma.admin.create({
      data: {
        email: "admin@roomsdekho.com",
        password: hashedPassword,
        firstName: "Main",
        lastName: "Administrator",
        phone: "+919999999999",
        role: "MAIN_ADMIN",
        isActive: true,
      },
    });

    console.log("✅ Main admin created successfully!");
    console.log("\n📋 Admin Details:");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: Admin@123`);
    console.log(`Role: ${admin.role}`);
    console.log("\n⚠️  IMPORTANT: Please change the password after first login!");
    console.log(`\n🔗 Login at: http://localhost:4000/login`);
  } catch (error: any) {
    console.error("❌ Failed to create main admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createMainAdmin();