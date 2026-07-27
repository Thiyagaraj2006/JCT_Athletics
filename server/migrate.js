import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    await pool.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;');
    console.log("Migration successful: added avatar_url");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}
migrate();
