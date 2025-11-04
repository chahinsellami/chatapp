import { Client } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:FbQsWLzWQcbcVRgdumSODOrAaqeNpBQB@interchange.proxy.rlwy.net:30292/railway";

async function removeAudioUrlColumn() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log("✓ Connected to PostgreSQL");

    // Check if column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='direct_messages' AND column_name='audio_url';
    `);

    if (checkColumn.rows.length === 0) {
      console.log("✓ Column audio_url does not exist, skipping...");
    } else {
      // Drop audio_url column from direct_messages table
      await client.query(`
        ALTER TABLE direct_messages 
        DROP COLUMN IF EXISTS audio_url;
      `);
      console.log("✓ Removed audio_url column from direct_messages table");
    }

    console.log("\n✅ Migration complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await client.end();
  }
}

removeAudioUrlColumn();
