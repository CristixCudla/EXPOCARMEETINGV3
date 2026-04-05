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
    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
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

async function fixSponsorLogo() {
  console.log('🔧 Fixing Auto Mingiuc sponsor logo URL...');

  try {
    // Find Auto Mingiuc sponsor
    const { data: sponsor, error: findError } = await supabase
      .from('sponsors')
      .select('*')
      .eq('name', 'AUTO MINGIUC')
      .maybeSingle();

    if (findError) {
      throw new Error(`Error finding sponsor: ${findError.message}`);
    }

    if (!sponsor) {
      console.log('⚠️  No Auto Mingiuc sponsor found in database.');
      return;
    }

    console.log('📍 Current logo URL:', sponsor.logo_url);

    // Update with correct URL
    const { data, error } = await supabase
      .from('sponsors')
      .update({
        logo_url: '/auto-mingiuc-logo.png'
      })
      .eq('id', sponsor.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating sponsor: ${error.message}`);
    }

    console.log('✅ Sponsor logo URL updated successfully!');
    console.log('📍 New logo URL:', data.logo_url);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

fixSponsorLogo();
