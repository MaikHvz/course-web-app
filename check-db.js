const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function check() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
  const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
  
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('courses').select('id, title, is_published, slug');
  
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

check();
