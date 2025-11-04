import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/postgres";

const uploadDir = join(process.cwd(), "public", "avatars");
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

    // Validate file type (images only)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max for avatars)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Image too large (max 5MB)" },
        { status: 413 }
      );
    }

    // Create avatars directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error("Error creating avatar directory:", err);
    }

    // Generate unique filename
    const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const ext = file.name.split(".").pop();
    const filename = `${decoded.userId}-${fileId}.${ext}`;
    const filepath = join(uploadDir, filename);

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const avatarUrl = `/avatars/${filename}`;

    // Update user's avatar in database
    await pool.query(
      "UPDATE users SET avatar = $1 WHERE id = $2",
      [avatarUrl, decoded.userId]
    );

    return NextResponse.json(
      {
        success: true,
        avatarUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Avatar upload failed" },
      { status: 500 }
    );
  }
};
