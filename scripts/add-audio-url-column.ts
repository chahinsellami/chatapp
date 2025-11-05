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
    

    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='direct_messages' AND column_name='audio_url';
    `);

    if (checkColumn.rows.length > 0) {
      
    } else {
      // Add audio_url column to direct_messages table
      await client.query(`
        ALTER TABLE direct_messages 
        ADD COLUMN audio_url TEXT;
      `);
      
    }

    
  } catch (error) {
    
    throw error;
  } finally {
    await client.end();
  }
}

addAudioUrlColumn()
  .then(() => {
    
    process.exit(0);
  })
  .catch((error) => {
    
    process.exit(1);
  });
