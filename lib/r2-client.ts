/// <reference types="@cloudflare/workers-types" />

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';

// Cliente S3 para desarrollo local
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('Faltan credenciales de R2. Configura CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID y CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    }

    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3Client;
}

const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'product-images';

/**
 * Sube una imagen a R2
 */
export async function uploadImageToR2(
  key: string,
  data: ArrayBuffer | Buffer,
  contentType: string
): Promise<void> {
  const client = getS3Client();
  
  await client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: Buffer.from(data),
    ContentType: contentType,
  }));
}

/**
 * Obtiene una imagen de R2
 */
export async function getImageFromR2(key: string): Promise<Buffer | null> {
  try {
    const client = getS3Client();
    
    const response = await client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));

    if (!response.Body) {
      return null;
    }

    // Convertir stream a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return null;
    }
    throw error;
  }
}

/**
 * Elimina una imagen de R2
 */
export async function deleteImageFromR2(key: string): Promise<void> {
  const client = getS3Client();
  
  await client.send(new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  }));
}

/**
 * Lista todas las imágenes en R2
 */
export async function listImagesInR2(): Promise<{ key: string; etag: string }[]> {
  const client = getS3Client();
  
  const response = await client.send(new ListObjectsV2Command({
    Bucket: bucketName,
  }));

  return (response.Contents || []).map(item => ({
    key: item.Key || '',
    etag: item.ETag || '',
  }));
}

/**
 * Verifica si una imagen existe en R2
 */
export async function imageExistsInR2(key: string): Promise<boolean> {
  try {
    const client = getS3Client();
    
    await client.send(new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));
    
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Obtiene metadata de una imagen en R2
 */
export async function getImageMetadataFromR2(key: string): Promise<{ etag: string; contentType?: string } | null> {
  try {
    const client = getS3Client();
    
    const response = await client.send(new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));

    return {
      etag: response.ETag || '',
      contentType: response.ContentType,
    };
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return null;
    }
    throw error;
  }
}
