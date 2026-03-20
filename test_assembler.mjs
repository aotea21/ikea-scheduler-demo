import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const authId = crypto.randomUUID();
    console.log("Testing insert into users...");
    const { error: e1 } = await adminClient.from('users').insert({ id: authId, email: `test_${authId}@example.com`, role: 'ASSEMBLER' });
    console.log("Users insert:", e1 ? e1.message : "Success");
    
    console.log("Testing insert into profiles...");
    const { error: e2 } = await adminClient.from('profiles').insert({ id: authId, email: `test_${authId}@example.com`, role: 'ASSEMBLER', assembler_id: authId });
    console.log("Profiles insert:", e2 ? e2.message : "Success");

    console.log("Testing insert into assemblers...");
    const { error: e3 } = await adminClient.from('assemblers').insert({ user_id: authId, name: 'Test', phone_primary: '123' });
    console.log("Assemblers insert:", e3 ? e3.message : "Success");
    
    // Cleanup
    await adminClient.from('assemblers').delete().eq('user_id', authId);
    await adminClient.from('profiles').delete().eq('id', authId);
    await adminClient.from('users').delete().eq('id', authId);
}
run();
