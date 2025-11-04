import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const uploadDir = join(process.cwd(), "public", "uploads");

const generateFileId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const POST = async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "No userId provided" },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    // Create uploads directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error("Error creating upload directory:", err);
    }

    // Generate unique filename
    const fileId = generateFileId();
    const ext = file.name.split(".").pop();
    const filename = `${fileId}.${ext}`;
    const filepath = join(uploadDir, filename);

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Return file metadata
    return NextResponse.json(
      {
        success: true,
        file: {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: `/uploads/${filename}`,
          uploadedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
};
