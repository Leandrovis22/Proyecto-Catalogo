import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/drizzle/schema.ts',
  out: './drizzle',
  connectionString: process.env.DATABASE_URL || ''
} as any)
