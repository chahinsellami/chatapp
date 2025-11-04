import { Client } from "pg";

const connectionString =
  "postgresql://postgres:FbQsWLzWQcbcVRgdumSODOrAaqeNpBQB@interchange.proxy.rlwy.net:30292/railway";

async function createMessagesTable() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log("✓ Connected to PostgreSQL");

    // Create direct_messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id VARCHAR(36) PRIMARY KEY,
        sender_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        edited_at TIMESTAMP,
        CONSTRAINT different_users CHECK (sender_id != receiver_id)
      );
    `);

    console.log("✓ Created direct_messages table");

    // Create index for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_direct_messages_users 
      ON direct_messages(sender_id, receiver_id);
    `);

    console.log("✓ Created indexes");

    // Check if there are any messages
    const result = await client.query("SELECT COUNT(*) FROM direct_messages");
    console.log(`📊 Total messages in database: ${result.rows[0].count}`);

    console.log("\n✅ Database setup complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await client.end();
  }
}

createMessagesTable()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
