import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";

const uploadDir = join(process.cwd(), "public", "voice-messages");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const POST = async (request: NextRequest) => {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (audio only)
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "Only audio files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max for voice messages)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Audio too large (max 10MB)" },
        { status: 413 }
      );
    }

    // Create voice-messages directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error("Error creating voice message directory:", err);
    }

    // Generate unique filename
    const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const ext = "webm"; // We're recording in webm format
    const filename = `${decoded.userId}-${fileId}.${ext}`;
    const filepath = join(uploadDir, filename);

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const audioUrl = `/voice-messages/${filename}`;

    return NextResponse.json(
      {
        success: true,
        audioUrl,
        duration: 0, // You could calculate this if needed
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Voice message upload error:", error);
    return NextResponse.json(
      { error: "Voice message upload failed" },
      { status: 500 }
    );
  }
};
