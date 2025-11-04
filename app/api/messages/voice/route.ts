import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "video", // Cloudinary treats audio as video
      folder: "voice-messages",
      public_id: `${decoded.userId}-${Date.now()}`,
    });

    return NextResponse.json(
      {
        success: true,
        audioUrl: result.secure_url,
        duration: 0,
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
