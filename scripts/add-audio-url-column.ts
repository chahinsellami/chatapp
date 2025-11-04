import { Client } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:FbQsWLzWQcbcVRgdumSODOrAaqeNpBQB@interchange.proxy.rlwy.net:30292/railway";

async function addAudioUrlColumn() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log("✓ Connected to PostgreSQL");

    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='direct_messages' AND column_name='audio_url';
    `);

    if (checkColumn.rows.length > 0) {
      console.log("✓ Column audio_url already exists, skipping...");
    } else {
      // Add audio_url column to direct_messages table
      await client.query(`
        ALTER TABLE direct_messages 
        ADD COLUMN audio_url TEXT;
      `);
      console.log("✓ Added audio_url column to direct_messages table");
    }

    console.log("\n✅ Migration complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await client.end();
  }
}

addAudioUrlColumn()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
