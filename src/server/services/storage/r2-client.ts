import { S3Client } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 client - S3-compatible object storage
 *
 * Required env vars for runtime:
 * - R2_ACCOUNT_ID: Cloudflare account ID
 * - R2_ACCESS_KEY_ID: R2 API token access key
 * - R2_SECRET_ACCESS_KEY: R2 API token secret
 * - R2_BUCKET_NAME: Target bucket name
 *
 * Setup: https://dash.cloudflare.com → R2 → Create bucket → Manage API Tokens
 */
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID ?? ""}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

/**
 * R2 bucket name for file storage
 */
export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "";
