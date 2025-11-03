import { initializeDatabase, getAllChannels } from "@/lib/db";

/**
 * GET /api/channels
 * Get all public channels
 */
export async function GET() {
  try {
    // Initialize database (will create tables if they don't exist)
    initializeDatabase();

    const channels = getAllChannels();
    return Response.json(channels);
  } catch (error) {
    console.error("Get channels error:", error);
    return Response.json({ error: "Failed to get channels" }, { status: 500 });
  }
}
