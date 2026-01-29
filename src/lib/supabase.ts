import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://bmzwfvtzlamocbjkotpj.supabase.co;
const supabaseKey = process.env.sb_publishable_nHtahQDlELfYROjz - F3Fhw_S1yNPJzC;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
