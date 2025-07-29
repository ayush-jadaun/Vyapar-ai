// /app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadCSV } from "../../../lib/cloudinary";
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("csv") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No CSV file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a CSV" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadCSV(buffer, file.name);

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        filename: uploadResult.original_filename,
        size: uploadResult.bytes,
        uploadedAt: uploadResult.created_at,
      },
    });
  } catch (error) {
    console.error("CSV upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload CSV file" },
      { status: 500 }
    );
  }
}
