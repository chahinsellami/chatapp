/**
 * Admin API route to migrate avatar column from VARCHAR(255) to TEXT
 * This is a one-time migration endpoint
 * 
 * To run: Visit https://your-domain.vercel.app/api/admin/migrate-avatar
 */

import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/postgres";

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication to prevent unauthorized access
    // const authHeader = request.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const client = await pool.connect();

    try {
      console.log("🔄 Starting avatar column migration...");

      // Change avatar column type from VARCHAR(255) to TEXT
      await client.query(`
        ALTER TABLE users 
        ALTER COLUMN avatar TYPE TEXT
      `);

      console.log("✅ Successfully updated avatar column to TEXT type");

      return NextResponse.json({
        success: true,
        message: "Avatar column successfully migrated from VARCHAR(255) to TEXT",
        note: "You can now upload custom profile images up to 5MB",
      });
    } catch (error) {
      console.error("❌ Migration failed:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("💥 Migration error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
