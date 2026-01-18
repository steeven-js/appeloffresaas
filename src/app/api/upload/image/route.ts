import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { auth } from "~/server/auth";
import { r2Client, R2_BUCKET } from "~/server/services/storage";

/**
 * Accepted image MIME types for editor uploads
 */
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * Maximum image size (5 MB)
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Generate a unique storage key for editor images
 */
function generateStorageKey(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const randomId = crypto.randomUUID().slice(0, 8);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `editor-images/${userId}/${timestamp}-${randomId}-${sanitizedFileName}`;
}

/**
 * POST /api/upload/image - Upload an image for the rich text editor
 * Returns a signed URL that can be used directly in the editor
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Check if R2 is configured
    if (!R2_BUCKET) {
      return NextResponse.json(
        { error: "Le stockage de fichiers n'est pas configuré" },
        { status: 503 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucune image fournie" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Type d'image non accepté. Formats acceptés: JPEG, PNG, WebP, GIF",
          acceptedTypes: ACCEPTED_IMAGE_TYPES,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          error: "Image trop volumineuse (max 5 Mo)",
          maxSize: MAX_IMAGE_SIZE,
          maxSizeMB: MAX_IMAGE_SIZE / (1024 * 1024),
        },
        { status: 400 }
      );
    }

    // Generate storage key
    const storageKey = generateStorageKey(session.user.id, file.name);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: storageKey,
        Body: buffer,
        ContentType: file.type,
        ContentLength: file.size,
        Metadata: {
          originalName: encodeURIComponent(file.name),
          uploadedBy: session.user.id,
          uploadedAt: new Date().toISOString(),
        },
      })
    );

    // Generate signed URL for the image (valid for 7 days)
    const signedUrl = await getSignedUrl(
      r2Client,
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: storageKey,
        ResponseContentType: file.type,
      }),
      { expiresIn: 7 * 24 * 3600 } // 7 days
    );

    // Return success with the signed URL
    return NextResponse.json({
      success: true,
      url: signedUrl,
      storageKey,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload de l'image" },
      { status: 500 }
    );
  }
}
