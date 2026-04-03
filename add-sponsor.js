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

async function addAutoMingiucSponsor() {
  console.log('🚀 Adăugare sponsor Auto Mingiuc...');

  try {
    // Check if sponsor already exists
    const { data: existing, error: checkError } = await supabase
      .from('sponsors')
      .select('*')
      .eq('name', 'AUTO MINGIUC')
      .maybeSingle();

    if (checkError) {
      console.error('Eroare la verificare sponsor:', checkError);
    }

    if (existing) {
      console.log('⚠️  Sponsor-ul Auto Mingiuc există deja!');
      console.log('Sponsor ID:', existing.id);
      return;
    }

    // Add Auto Mingiuc sponsor
    const { data, error } = await supabase
      .from('sponsors')
      .insert({
        name: 'AUTO MINGIUC',
        website_url: 'https://tractarifalticeni.ro',
        logo_url: 'https://expocarmeeting.ro/images/auto-mingiuc-official.png'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Eroare la adăugare sponsor: ${error.message}`);
    }

    console.log('✅ Sponsor Auto Mingiuc adăugat cu succes!');
    console.log('Sponsor ID:', data.id);
    console.log('Nume:', data.name);
    console.log('Website:', data.website_url);
    console.log('Logo URL:', data.logo_url);

  } catch (error) {
    console.error('\n❌ EROARE:', error.message);
    process.exit(1);
  }
}

addAutoMingiucSponsor();
