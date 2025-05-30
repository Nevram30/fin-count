// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type" },
        { status: 400 }
      );
    }

    // Max size: 2MB
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File too large (max 2MB)" },
        { status: 400 }
      );
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExtension}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads/profile-photos");
    await mkdir(uploadDir, { recursive: true });

    // Save the file
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return the file URL (path that can be used in <Image> component)
    const fileUrl = `/uploads/profile-photos/${fileName}`;

    return NextResponse.json({
      success: true,
      fileUrl: fileUrl,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
