import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

//config({ path: '.env.local' });
config();

export default defineConfig({
  schema: './db/schema',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  }
});
