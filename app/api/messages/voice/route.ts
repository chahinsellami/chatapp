import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import jwt from "jsonwebtoken";

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

    // Generate unique filename
    const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const ext = "webm"; // We're recording in webm format
    const filename = `voice-messages/${decoded.userId}-${fileId}.${ext}`;

    // Upload to Vercel Blob Storage
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json(
      {
        success: true,
        audioUrl: blob.url,
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
