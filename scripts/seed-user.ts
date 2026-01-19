/**
 * Seed script for creating/resetting a user
 * Run with: node --env-file=.env --env-file=.env.local --import tsx scripts/seed-user.ts
 *
 * This script will:
 * - Create a new user if the email doesn't exist
 * - Reset the password if the user already exists
 */
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema/auth";

// Default user credentials - can be overridden via environment variables
const DEFAULT_EMAIL = "jacques.steeven@gmail.com";
const DEFAULT_PASSWORD = "Password123";
const DEFAULT_NAME = "Steeven Jacques";

async function seedUser() {
  const email = process.env.SEED_USER_EMAIL ?? DEFAULT_EMAIL;
  const password = process.env.SEED_USER_PASSWORD ?? DEFAULT_PASSWORD;
  const name = process.env.SEED_USER_NAME ?? DEFAULT_NAME;

  console.log("🌱 Starting user seed...\n");
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);

  // Hash the password with bcrypt (cost factor 12)
  const hashedPassword = await hash(password, 12);

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    // Update existing user's password
    console.log(`\n✓ User found: ${existingUser.name ?? existingUser.email}`);
    console.log("   Resetting password...");

    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id));

    console.log("   ✓ Password reset successfully!");
  } else {
    // Create new user
    console.log("\n   User not found, creating new user...");

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        password: hashedPassword,
        emailVerified: new Date(), // Mark as verified
        subscriptionTier: "FREE",
      })
      .returning();

    console.log(`   ✓ User created: ${newUser!.name ?? newUser!.email}`);
    console.log(`   ID: ${newUser!.id}`);
  }

  console.log("\n✅ User seed completed successfully!");
  console.log("\n📋 You can now log in with:");
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);

  process.exit(0);
}

seedUser().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
