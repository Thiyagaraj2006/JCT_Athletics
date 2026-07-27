import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Construct postgres connection string from Supabase URL and ANON KEY if possible, or just use process.env.DATABASE_URL if available.
// Since we don't have direct DB URL in the env (usually), I will just print the SQL for the user OR try to use Supabase RPC if one exists.
// Actually, earlier in this project, I used a migration script that failed because no `pg` was installed. I skipped DB updates.
// Wait! The user approved a file-based storage for avatars to skip DB changes.
// But for competitions, we NEED a DB table!
// Can I create a table using Supabase API? No, DDL requires SQL.
// I will create a SQL file and run it using `psql` if they have it, or instruct the user to run it in Supabase SQL editor.
// Wait, I can try to find the DATABASE_URL in .env.

console.log(`
-- PLEASE RUN THIS SQL IN YOUR SUPABASE SQL EDITOR --

CREATE TABLE IF NOT EXISTS public.competition_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  competition_name TEXT NOT NULL,
  date DATE,
  event TEXT,
  result_mark TEXT,
  postion INTEGER,
  medal TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.competition_results DISABLE ROW LEVEL SECURITY;
`);
