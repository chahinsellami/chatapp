/**
 * Database initialization endpoint
 * Visit this URL once to run migrations
 */

import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/postgres";

export async function GET() {
  try {
    await initializeDatabase();

    return NextResponse.json({
      success: true,
      message: "Database initialized and avatar column migrated to TEXT type",
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
