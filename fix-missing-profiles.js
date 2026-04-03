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

async function fixMissingProfiles() {
  console.log('🔍 Căutare utilizatori fără profile...');

  try {
    // Get all users from Supabase Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Eroare la listare utilizatori: ${authError.message}`);
    }

    console.log(`📊 Total utilizatori în Auth: ${users.length}`);

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError) {
      throw new Error(`Eroare la listare profile: ${profilesError.message}`);
    }

    const profileIds = new Set(profiles.map(p => p.id));
    console.log(`📊 Total profile în DB: ${profiles.length}`);

    // Find users without profiles
    const usersWithoutProfiles = users.filter(u => !profileIds.has(u.id));
    
    console.log(`⚠️  Utilizatori fără profile: ${usersWithoutProfiles.length}`);

    if (usersWithoutProfiles.length === 0) {
      console.log('✅ Toți utilizatorii au profile!');
      return;
    }

    // Create missing profiles
    for (const user of usersWithoutProfiles) {
      console.log(`\n📝 Creare profil pentru: ${user.email}`);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          role: 'user'
        });

      if (insertError) {
        console.error(`❌ Eroare pentru ${user.email}:`, insertError.message);
      } else {
        console.log(`✅ Profil creat pentru ${user.email}`);
      }
    }

    console.log('\n🎉 GATA! Toate profilele au fost create!');

  } catch (error) {
    console.error('\n❌ EROARE:', error.message);
    process.exit(1);
  }
}

fixMissingProfiles();
