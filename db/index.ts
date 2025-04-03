import {config} from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import path from 'path'
import postgres from 'postgres'

config({path: path.resolve(__dirname, '../.env.local')})

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

//const allUsers = await db.select().from(...);


