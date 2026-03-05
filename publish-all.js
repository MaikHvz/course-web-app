const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function publishAll() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
  const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
  
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('courses').update({ is_published: true }).neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) console.error(error);
  else console.log('All courses published successfully.');
}

publishAll();
