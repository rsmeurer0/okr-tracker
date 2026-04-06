import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// This client is for server-side usage only (Server Actions, Route Handlers, Server Components)
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // required for Supabase Transaction mode pooler
})

export const db = drizzle(client, { schema })
