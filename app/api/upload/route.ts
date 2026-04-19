import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image." }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB." }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      // Directory might already exist, continue
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the public URL
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}