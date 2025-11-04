import { Client } from "pg";

async function clearUsers() {
  // Railway PostgreSQL connection string
  const databaseUrl = "postgresql://postgres:FbQsWLzWQcbcVRgdumSODOrAaqeNpBQB@interchange.proxy.rlwy.net:30292/railway";
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false, // Required for Railway
    },
  });

  try {
    await client.connect();
    console.log("✓ Connected to PostgreSQL");

    // Delete in correct order to respect foreign key constraints
    console.log("🗑️  Deleting direct messages...");
    await client.query("DELETE FROM direct_messages").catch(e => console.log("  (table not found or empty)"));
    
    console.log("🗑️  Deleting friend requests...");
    await client.query("DELETE FROM friend_requests").catch(e => console.log("  (table not found or empty)"));
    
    console.log("🗑️  Deleting friends...");
    await client.query("DELETE FROM friends").catch(e => console.log("  (table not found or empty)"));
    
    console.log("🗑️  Deleting users...");
    const result = await client.query("DELETE FROM users");
    console.log(`  Deleted ${result.rowCount} users`);
    
    console.log("✅ All users and related data cleared!");
    console.log("\n📝 You can now create new users with proper UUIDs");
    
  } catch (error) {
    console.error("❌ Error clearing users:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
clearUsers()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });
