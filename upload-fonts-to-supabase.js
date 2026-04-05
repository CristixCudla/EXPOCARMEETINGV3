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

async function uploadFontsToSupabase() {
  console.log('🚀 Uploading fonts to Supabase Storage...\n');

  const fonts = [
    { file: 'Supercharge.otf', type: 'application/octet-stream' },
    { file: 'CyberwayRiders.ttf', type: 'application/octet-stream' }
  ];

  for (const font of fonts) {
    try {
      const fontPath = path.join(__dirname, 'public', 'fonts', font.file);
      const fontBuffer = fs.readFileSync(fontPath);

      const { data, error } = await supabase.storage
        .from('car-images')
        .upload(`static/fonts/${font.file}`, fontBuffer, {
          contentType: font.type,
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(`static/fonts/${font.file}`);

      console.log(`✅ ${font.file} uploaded!`);
      console.log(`📍 URL: ${publicUrl}\n`);

    } catch (error) {
      console.error(`❌ ERROR uploading ${font.file}:`, error.message);
    }
  }
}

uploadFontsToSupabase();
