const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runMigration() {
  console.log('🚀 Rulare migrare voting_sessions...');

  try {
    const sql = fs.readFileSync(path.join(__dirname, 'voting-session-migration.sql'), 'utf8');
    
    // Execute SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try alternative method
      console.log('ℹ️  Încercare metodă alternativă...');
      
      // Create table manually
      const { error: createError } = await supabase
        .from('voting_sessions')
        .select('id')
        .limit(1);
      
      if (createError && createError.code === '42P01') {
        console.log('⚠️  Tabela nu există. Trebuie să rulezi SQL manual în Supabase Dashboard:');
        console.log('\n' + sql);
        console.log('\n📝 Copiază SQL-ul de mai sus și rulează-l în Supabase SQL Editor');
      } else if (createError) {
        throw createError;
      } else {
        console.log('✅ Tabela voting_sessions există deja!');
      }
    } else {
      console.log('✅ Migrare completă!');
    }

  } catch (error) {
    console.error('❌ Eroare:', error.message);
  }
}

runMigration();
