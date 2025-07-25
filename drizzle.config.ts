import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

//config({ path: '.env.local' });
config();
console.log("vercel console", process.env.DATABASE_URL);

export default defineConfig({
  schema: './db/schema',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  }
});
