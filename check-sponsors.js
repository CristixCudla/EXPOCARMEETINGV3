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
    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
    envVars[key] = value;
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkSponsors() {
  console.log('🔍 Checking sponsors table...\n');

  try {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*');

    if (error) {
      throw new Error(`Error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No sponsors found in database.');
      return;
    }

    console.log(`✅ Found ${data.length} sponsor(s):\n`);
    data.forEach((sponsor, index) => {
      console.log(`${index + 1}. ${sponsor.name}`);
      console.log(`   ID: ${sponsor.id}`);
      console.log(`   Logo URL: ${sponsor.logo_url}`);
      console.log(`   Website: ${sponsor.website_url}`);
      console.log('');
    });

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

checkSponsors();
