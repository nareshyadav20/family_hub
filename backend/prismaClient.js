const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const rawConnectionString = process.env.DATABASE_URL;

// Parse the connection string to remove search params (like sslmode) 
// so pg-connection-string doesn't overwrite our explicit ssl config
let cleanConnectionString = rawConnectionString;
try {
  const url = new URL(rawConnectionString);
  url.search = ''; // Strip all query parameters
  cleanConnectionString = url.toString();
} catch (e) {
  console.warn('⚠️ [pg.Pool] Could not parse DATABASE_URL, using raw string');
}

// Configure Pool for serverless environments (Supabase Pooler)
const pool = new Pool({ 
  connectionString: cleanConnectionString,
  max: 20, // Limit connections to prevent overwhelming the pooler
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  allowExitOnIdle: true,
  // Explicitly set SSL options; this will now be respected by pg
  ssl: rawConnectionString?.includes('localhost') ? false : { rejectUnauthorized: false }
});

// CRITICAL: Handle unexpected connection drops from Supabase to prevent crashing
pool.on('error', (err, client) => {
  console.error('❌ [pg.Pool] Unexpected error on idle client:', err.message);
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
