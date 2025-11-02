/// <reference types="@cloudflare/workers-types" />

// Tipos para los bindings de Cloudflare
export interface CloudflareEnv {
  DB: D1Database;
  PRODUCT_IMAGES: R2Bucket;
}

// Helper para obtener el runtime de Cloudflare en Next.js
export function getCloudflareContext() {
  // @ts-ignore - Cloudflare runtime injection
  return process.env as unknown as CloudflareEnv;
}

// Helper para obtener D1
export function getD1() {
  const env = getCloudflareContext();
  if (!env.DB) {
    throw new Error('D1 Database not available. Make sure you are running with Wrangler.');
  }
  return env.DB;
}

// Helper para obtener R2
export function getR2() {
  const env = getCloudflareContext();
  if (!env.PRODUCT_IMAGES) {
    throw new Error('R2 Bucket not available. Make sure you are running with Wrangler.');
  }
  return env.PRODUCT_IMAGES;
}
