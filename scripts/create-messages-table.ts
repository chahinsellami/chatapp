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

    

    // Create index for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_direct_messages_users 
      ON direct_messages(sender_id, receiver_id);
    `);

    

    // Check if there are any messages
    const result = await client.query("SELECT COUNT(*) FROM direct_messages");
    

    
  } catch (error) {
    
    throw error;
  } finally {
    await client.end();
  }
}

createMessagesTable()
  .then(() => {
    
    process.exit(0);
  })
  .catch((error) => {
    
    process.exit(1);
  });
