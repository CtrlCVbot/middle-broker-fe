import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

//const allUsers = await db.select().from(...);


