/**
 * Database connection helper for Cloudflare D1 (development placeholder)
 * In production (Cloudflare Pages) bind a D1 instance and set DATABASE_URL accordingly.
 */
import { drizzle } from 'drizzle-orm/d1'

const databaseUrl = process.env.DATABASE_URL || ''

export function getDb(d1Database: any) {
  // On Cloudflare Pages, you'll receive the D1 binding in the request context or at runtime.
  // For local development, you can use sqlite or a local D1 emulator.
  if (!d1Database && !databaseUrl) {
    console.warn('No D1 instance or DATABASE_URL provided. getDb will throw if used.')
  }

  // If running on Cloudflare D1, pass the binding object here.
  try {
    return drizzle(d1Database ?? (databaseUrl ? { /* adapter placeholder */ } : undefined))
  } catch (err) {
    console.warn('drizzle initialization placeholder:', err)
    return null
  }
}
