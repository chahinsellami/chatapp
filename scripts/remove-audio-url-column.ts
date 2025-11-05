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
    

    // Check if column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='direct_messages' AND column_name='audio_url';
    `);

    if (checkColumn.rows.length === 0) {
      
    } else {
      // Drop audio_url column from direct_messages table
      await client.query(`
        ALTER TABLE direct_messages 
        DROP COLUMN IF EXISTS audio_url;
      `);
      
    }

    
  } catch (error) {
    
    throw error;
  } finally {
    await client.end();
  }
}

removeAudioUrlColumn();
