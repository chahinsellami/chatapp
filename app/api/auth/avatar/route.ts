import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/postgres";

const uploadDir = join(process.cwd(), "public", "avatars");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const POST = async (request: NextRequest) => {
  try {
    return NextResponse.json(
      { error: "File uploads are temporarily disabled on Vercel. Please use an avatar URL or Gravatar instead." },
      { status: 503 }
    );
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Avatar upload failed" },
      { status: 500 }
    );
  }
};
