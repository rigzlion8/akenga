import { writeFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = join(process.cwd(), "uploads");

async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET;

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }
  return null;
}

function getStorageConfig() {
  const cloudinary = getCloudinaryConfig();
  const useS3 =
    !!process.env.S3_BUCKET &&
    !!process.env.S3_REGION &&
    !!process.env.S3_ACCESS_KEY &&
    !!process.env.S3_SECRET_KEY;

  return {
    provider: cloudinary ? ("cloudinary" as const) : useS3 ? ("s3" as const) : ("local" as const),
    cloudinary,
  };
}

async function saveToLocal(buffer: Buffer, originalName: string): Promise<{ url: string; filename: string }> {
  await ensureUploadDir();

  const ext = extname(originalName) || ".bin";
  const filename = `${randomUUID()}${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  await writeFile(filepath, buffer);

  const baseUrl = process.env.UPLOAD_BASE_URL || "/uploads";
  return { url: `${baseUrl}/${filename}`, filename };
}

async function saveToCloudinary(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  config: NonNullable<ReturnType<typeof getCloudinaryConfig>>,
): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  formData.append("file", blob, originalName);
  formData.append("api_key", config.apiKey);

  const timestamp = Math.floor(Date.now() / 1000).toString();
  formData.append("timestamp", timestamp);

  const signature = await generateCloudinarySignature(timestamp, config.apiSecret);
  formData.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Cloudinary upload failed: ${await res.text()}`);

  const data = (await res.json()) as { secure_url: string; public_id: string };
  return { url: data.secure_url, filename: data.public_id };
}

async function generateCloudinarySignature(timestamp: string, apiSecret: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  const hash = createHash("sha1");
  hash.update(`timestamp=${timestamp}${apiSecret}`);
  return hash.digest("hex");
}

async function saveToS3(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<{ url: string; filename: string }> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

  const bucket = process.env.S3_BUCKET!;
  const region = process.env.S3_REGION!;

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  });

  const ext = extname(originalName) || ".bin";
  const key = `uploads/${randomUUID()}${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: new Uint8Array(buffer),
      ContentType: mimeType,
    }),
  );

  const endpoint = process.env.S3_ENDPOINT;
  const url = endpoint
    ? `${endpoint}/${bucket}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { url, filename: key };
}

export async function uploadImage(
  base64: string,
  originalName: string,
): Promise<{ url: string; filename: string }> {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 image data");

  const mimeType = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");

  const { provider, cloudinary } = getStorageConfig();

  switch (provider) {
    case "cloudinary":
      return saveToCloudinary(buffer, originalName, mimeType, cloudinary!);
    case "s3":
      return saveToS3(buffer, originalName, mimeType);
    default:
      return saveToLocal(buffer, originalName);
  }
}
