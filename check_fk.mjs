import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: d2, error: e2 } = await supabase.from('users').select('id').limit(1);
  console.log("users table:", e2 ? e2.message : "Exists");
  const { data: d3, error: e3 } = await supabase.from('profiles').select('id').limit(1);
  console.log("profiles table:", e3 ? e3.message : "Exists");
}
run();
