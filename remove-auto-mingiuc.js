const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function removeAutoMingiuc() {
  console.log('🗑️  Ștergere AUTO MINGIUC din sponsors (acum e hardcoded)...');

  try {
    const { error } = await supabase
      .from('sponsors')
      .delete()
      .eq('name', 'AUTO MINGIUC')

    if (error) {
      throw new Error(`Eroare la ștergere: ${error.message}`);
    }

    console.log('✅ AUTO MINGIUC șters cu succes din sponsors!');
    console.log('ℹ️  Acum AUTO MINGIUC este hardcoded ca "Partener Oficial" pe homepage');

  } catch (error) {
    console.error('\n❌ EROARE:', error.message);
    process.exit(1);
  }
}

removeAutoMingiuc();
