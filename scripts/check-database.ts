import { Client } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:FbQsWLzWQcbcVRgdumSODOrAaqeNpBQB@interchange.proxy.rlwy.net:30292/railway";

async function checkDatabase() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    // Check if direct_messages table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'direct_messages'
      );
    `);
    if (tableCheck.rows[0].exists) {
      // Table exists, optionally add more checks here if needed
    }
  } catch (error) {
    // Optionally handle error
  } finally {
    await client.end();
  }
}

checkDatabase();
