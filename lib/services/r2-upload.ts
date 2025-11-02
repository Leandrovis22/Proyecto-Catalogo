// lib/services/r2-upload.ts
/**
 * Upload file to Cloudflare R2 using S3 API
 * This works from Node.js runtime (non-edge)
 */

export async function uploadToR2(
  filename: string,
  fileBuffer: ArrayBuffer,
  contentType: string
): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'product-images';

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Cloudflare R2 credentials not configured');
  }

  // Use AWS SDK v3 S3 Client (compatible with R2)
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: Buffer.from(fileBuffer),
    ContentType: contentType,
  });

  await s3Client.send(command);

  return `/api/images/${filename}`;
}
