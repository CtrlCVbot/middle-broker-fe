import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '@/db/schema';

config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const queryClient = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  max_lifetime: 60 * 30,
});

export const db = drizzle(queryClient, { schema });

const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
export const migrationDb = drizzle(migrationClient);

export async function testConnection() {
  try {
    await queryClient`SELECT 1`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

process.on('SIGTERM', async () => {
  console.log('Closing database connections...');
  await queryClient.end();
  await migrationClient.end();
  console.log('Database connections closed');
});
