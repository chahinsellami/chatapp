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
    console.log("✓ Connected to PostgreSQL\n");

    // Check if direct_messages table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'direct_messages'
      );
    `);
    
    console.log("📊 direct_messages table exists:", tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Get table structure
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'direct_messages'
        ORDER BY ordinal_position;
      `);
      
      console.log("\n📋 Table structure:");
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });

      // Count messages
      const count = await client.query(`SELECT COUNT(*) FROM direct_messages`);
      console.log(`\n💬 Total messages in database: ${count.rows[0].count}`);

      // Show sample messages
      if (parseInt(count.rows[0].count) > 0) {
        const sample = await client.query(`
          SELECT id, sender_id, receiver_id, text, created_at 
          FROM direct_messages 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        console.log("\n📨 Recent messages:");
        sample.rows.forEach(msg => {
          console.log(`  [${msg.created_at}] ${msg.sender_id} → ${msg.receiver_id}: ${msg.text}`);
        });
      }
    } else {
      console.log("\n❌ direct_messages table does NOT exist!");
      console.log("Run: npx tsx scripts/create-messages-table.ts");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.end();
  }
}

checkDatabase();
