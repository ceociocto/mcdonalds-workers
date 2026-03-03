import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/schema.ts',
  out: './drizzle',
  driver: 'd1-http',
  dbCredentials: {
    wranglerConfigPath: 'wrangler.toml',
    dbName: 'mcdonalds_db',
  },
} satisfies Config;
