// backend-restro/src/models/user/seed-admin.ts
import { connectDB } from "config/db";
import "dotenv/config";
import { UserTable } from "./user.model";
import { hashPassword } from "utils/hash";

async function seedAdmin() {
  try {
    console.log("Starting admin seed process...");
    await connectDB();
    console.log("✓ Database connection established");

    const adminEmail = "sajhilodigital@gmail.com";
    const plainPassword = "Admin@2025Secure!"; // ← CHANGE THIS IMMEDIATELY after first use!

    // Check if admin already exists
    const existingAdmin = await UserTable.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin user already exists. Skipping creation.");
      console.log("→ Email:", existingAdmin.email);
      console.log("→ Role:", existingAdmin.role);
      process.exit(0);
    }

    // Create new admin
    const hashedPassword = await hashPassword(plainPassword);

    const admin = await UserTable.create({
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      isVerified: true,
      isActive: true,
      // Optional fields (uncomment if your schema has them)
      // permissions: ['*'],
      // createdBy: 'system-seed-script',
    });

    console.log("\n╔════════════════════════════════════════════╗");
    console.log("║         ADMIN USER CREATED SUCCESSFULLY    ║");
    console.log("╚════════════════════════════════════════════╝");
    console.log(`Email:       ${admin.email}`);
    console.log(`Password:    ${plainPassword}   ← CHANGE THIS NOW!`);
    console.log(`Role:        ${admin.role}`);
    console.log(`User ID:     ${admin._id}`);
    console.log(`Created At:  ${admin.createdAt?.toISOString()}`);
    console.log("\nYou can now login with these credentials.");
    console.log(
      "IMPORTANT: Change the password immediately after first login!"
    );

    process.exit(0);
  } catch (error: any) {
    console.error("Failed to seed admin:");
    console.error(error.message || error);
    if (error.stack) console.error("Stack:", error.stack);
    process.exit(1);
  }
}

// Execute
seedAdmin();
