/// <reference types="@cloudflare/workers-types" />

/**
 * Sube una imagen a R2
 */
export async function uploadImageToR2(
  bucket: R2Bucket,
  key: string,
  data: ArrayBuffer,
  contentType: string
): Promise<void> {
  await bucket.put(key, data, {
    httpMetadata: {
      contentType,
    },
  });
}

/**
 * Obtiene una imagen de R2
 */
export async function getImageFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return await bucket.get(key);
}

/**
 * Elimina una imagen de R2
 */
export async function deleteImageFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}

/**
 * Lista todas las imágenes en R2
 */
export async function listImagesInR2(bucket: R2Bucket): Promise<R2Objects> {
  return await bucket.list();
}

/**
 * Verifica si una imagen existe en R2
 */
export async function imageExistsInR2(
  bucket: R2Bucket,
  key: string
): Promise<boolean> {
  const object = await bucket.head(key);
  return object !== null;
}

/**
 * Obtiene metadata de una imagen en R2
 */
export async function getImageMetadataFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2Object | null> {
  return await bucket.head(key);
}
