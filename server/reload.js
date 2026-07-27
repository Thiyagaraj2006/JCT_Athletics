import { supabase } from './supabaseClient.js';

async function check() {
  const { data, error } = await supabase.rpc('reload_schema_cache');
  console.log("RPC:", error);
}
check();
