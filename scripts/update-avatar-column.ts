/**
 * Migration script to update avatar column from VARCHAR(255) to TEXT
 * This allows storing Base64 encoded images which can be 50KB+ in size
 * 
 * Run with: npx tsx scripts/update-avatar-column.ts
 */

import { pool } from "../lib/postgres";

async function updateAvatarColumn() {
  const client = await pool.connect();

  try {
    console.log("🔄 Starting avatar column migration...");

    // Change avatar column type from VARCHAR(255) to TEXT
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN avatar TYPE TEXT
    `);

    console.log("✅ Successfully updated avatar column to TEXT type");
    console.log("📝 Avatar column can now store Base64 encoded images");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
updateAvatarColumn()
  .then(() => {
    console.log("✨ Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration failed with error:", error);
    process.exit(1);
  });
