const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function uploadLogoToSupabase() {
  console.log('🚀 Uploading Auto Mingiuc logo to Supabase Storage...\n');

  try {
    const logoPath = path.join(__dirname, 'public', 'auto-mingiuc-logo.png');
    const logoFile = fs.readFileSync(logoPath);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('car-images')
      .upload('static/auto-mingiuc-logo.png', logoFile, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl('static/auto-mingiuc-logo.png');

    console.log('✅ Logo uploaded successfully!');
    console.log('📍 Public URL:', publicUrl);
    console.log('\n💡 Use this URL in your code instead of /auto-mingiuc-logo.png');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

uploadLogoToSupabase();
