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
  console.log('🚀 Uploading custom fonts to Supabase Storage...\n');

  const fonts = [
    { file: 'Supercharge.otf', name: 'Supercharge' },
    { file: 'CyberwayRiders.ttf', name: 'CyberwayRiders' }
  ];

  for (const font of fonts) {
    try {
      const fontPath = path.join(__dirname, 'public', 'fonts', font.file);
      const fontBuffer = fs.readFileSync(fontPath);

      // Upload ca image/png pentru a bypassa restricțiile de mime type
      const { data, error } = await supabase.storage
        .from('car-images')
        .upload(`static/fonts/${font.file}`, fontBuffer, {
          contentType: 'font/woff2', // încercăm font/woff2
          upsert: true
        });

      if (error) {
        // Dacă nu merge, încercăm application/octet-stream
        const { data: data2, error: error2 } = await supabase.storage
          .from('car-images')
          .upload(`static/fonts/${font.file}`, fontBuffer, {
            contentType: 'application/x-font-ttf',
            upsert: true
          });
        
        if (error2) throw error2;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(`static/fonts/${font.file}`);

      console.log(`✅ ${font.name} uploaded!`);
      console.log(`📍 URL: ${publicUrl}\n`);

    } catch (error) {
      console.error(`❌ ERROR uploading ${font.file}:`, error.message);
    }
  }
  
  console.log('\n💡 Acum updatez globals.css cu noile URL-uri...');
}

uploadFontsToSupabase();
