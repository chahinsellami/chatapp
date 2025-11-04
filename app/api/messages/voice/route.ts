import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";

const uploadDir = join(process.cwd(), "public", "voice-messages");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const POST = async (request: NextRequest) => {
  try {
    return NextResponse.json(
      { error: "Voice messages are temporarily disabled on Vercel. File storage requires cloud storage setup." },
      { status: 503 }
    );
  } catch (error) {
    console.error("Voice message upload error:", error);
    return NextResponse.json(
      { error: "Voice message upload failed" },
      { status: 500 }
    );
  }
};
