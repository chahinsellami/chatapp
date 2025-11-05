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
      // Get table structure
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'direct_messages'
        ORDER BY ordinal_position;
      `);

      
      columns.rows.forEach((col) => {
        
      });

      // Count messages
      const count = await client.query(`SELECT COUNT(*) FROM direct_messages`);
      

      // Show sample messages
      if (parseInt(count.rows[0].count) > 0) {
        const sample = await client.query(`
          SELECT id, sender_id, receiver_id, text, created_at 
          FROM direct_messages 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        
        sample.rows.forEach((msg) => {
          console.log(
            `  [${msg.created_at}] ${msg.sender_id} → ${msg.receiver_id}: ${msg.text}`
          );
        });
      }
    } else {
      
      
    }
  } catch (error) {
    
  } finally {
    await client.end();
  }
}

checkDatabase();
