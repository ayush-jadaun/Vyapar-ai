// /lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  bytes: number;
  created_at: string;
}

export async function uploadCSV(
  fileBuffer: Buffer,
  filename: string
): Promise<UploadResult> {
  try {
    const result = await new Promise<UploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: "debt_collection_csvs",
            public_id: `csv_${Date.now()}_${filename.replace(/\.[^/.]+$/, "")}`,
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                original_filename: filename,
                bytes: result.bytes,
                created_at: result.created_at,
              });
            } else {
              reject(new Error("Upload failed - no result"));
            }
          }
        )
        .end(fileBuffer);
    });

    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload CSV to Cloudinary");
  }
}

export async function deleteCSV(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete CSV from Cloudinary");
  }
}
