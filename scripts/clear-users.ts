import { Client } from "pg";

async function clearUsers() {
  // Railway PostgreSQL connection string
  const databaseUrl =
    "postgresql://postgres:FbQsWLzWQcbcVRgdumSODOrAaqeNpBQB@interchange.proxy.rlwy.net:30292/railway";

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false, // Required for Railway
    },
  });

  try {
    await client.connect();

    // Delete in correct order to respect foreign key constraints
    await client.query("DELETE FROM direct_messages");
    await client.query("DELETE FROM friend_requests");
    await client.query("DELETE FROM friends");
    const result = await client.query("DELETE FROM users");
  } catch (error) {
    console.error("Error clearing users:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
clearUsers()
  .then(() => {
    console.log("Users cleared successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to clear users:", error);
    process.exit(1);
  });
