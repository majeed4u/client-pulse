import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@client-pulse/env/server";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export async function getPresignedUploadUrl(
  fileKey: string,
  mimeType: string,
  expiresIn = 900,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: mimeType,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function getPresignedDownloadUrl(
  fileKey: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: fileKey,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function deleteObject(fileKey: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileKey,
    }),
  );
}

export function getPublicUrl(fileKey: string): string {
  return `${env.CLOUDFLARE_R2_PUBLIC_URL}/${fileKey}`;
}
