import type { Config } from 'drizzle-kit';

const isDev = process.env.NODE_ENV === 'development';

const config: Config = {
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  ...(isDev
    ? { dbCredentials: { url: 'dev.db' } }
    : {
        driver: 'd1-http',
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
          databaseId: process.env.CLOUDFLARE_D1_ID!,
          token: process.env.CLOUDFLARE_D1_TOKEN!,
        },
      }),
};

export default config;
