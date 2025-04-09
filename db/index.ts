import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema/users';

config({ path: '.env.local' }); // or .env.local

// 쿼리 실행용 클라이언트
const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });

// 마이그레이션용 별도 클라이언트
const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
export const migrationDb = drizzle(migrationClient);

export * from '@/db/schema/users';
export * from '@/db/schema/companies';
