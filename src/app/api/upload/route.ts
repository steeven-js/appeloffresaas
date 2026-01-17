import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { auth } from "~/server/auth";
import { r2Client, R2_BUCKET } from "~/server/services/storage";

/**
 * Accepted MIME types for document uploads
 */
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
];

/**
 * Maximum file size (10 MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Generate a unique storage key for the file
 */
function generateStorageKey(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const randomId = crypto.randomUUID().slice(0, 8);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `documents/${userId}/${timestamp}-${randomId}-${sanitizedFileName}`;
}

/**
 * POST /api/upload - Upload a file to R2 storage
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
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Type de fichier non accepté",
          acceptedTypes: ACCEPTED_MIME_TYPES,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Fichier trop volumineux",
          maxSize: MAX_FILE_SIZE,
          maxSizeMB: MAX_FILE_SIZE / (1024 * 1024),
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

    // Return success with file info
    return NextResponse.json({
      success: true,
      file: {
        fileName: storageKey.split("/").pop() ?? file.name,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        storageKey,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}
