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

async function createAdminAccount() {
  const email = 'admin@expocarmeeting.ro';
  const password = 'admin123!';
  const fullName = 'Administrator';
  const role = 'admin';

  console.log('🚀 Creare cont admin...');
  console.log(`📧 Email: ${email}`);

  try {
    // 1. Create auth user
    console.log('\n📝 Pasul 1: Creare utilizator în Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.log('⚠️  Eroare Auth detectată:', authError.message);
      console.log('🔍 Verific dacă conține "already":', authError.message.toLowerCase().includes('already'));
      
      // Check if user already exists
      if (authError.message && authError.message.toLowerCase().includes('already')) {
        console.log('⚠️  Utilizatorul există deja în Auth. Încerc să găsesc user ID...');
        
        // Get user by email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          throw new Error(`Eroare la listare utilizatori: ${listError.message}`);
        }

        const existingUser = users.find(u => u.email === email);
        
        if (!existingUser) {
          throw new Error('Nu am putut găsi utilizatorul existent');
        }

        console.log(`✅ User găsit! ID: ${existingUser.id}`);

        // 2. Update or insert profile
        console.log('\n📝 Pasul 2: Actualizare profil cu rol admin...');
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: existingUser.id,
            email: email,
            full_name: fullName,
            role: role,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          throw new Error(`Eroare la actualizare profil: ${profileError.message}`);
        }

        console.log('✅ Rol admin setat cu succes!');
        console.log('\n🎉 SUCCES! Contul admin este gata!');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Parolă: ${password}`);
        console.log(`👤 Rol: ${role}`);
        
        return;
      }
      
      throw new Error(`Eroare la creare utilizator: ${authError.message}`);
    }

    console.log(`✅ Utilizator creat! ID: ${authData.user.id}`);

    // 2. Create profile with admin role
    console.log('\n📝 Pasul 2: Creare profil cu rol admin...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: role
      });

    if (profileError) {
      throw new Error(`Eroare la creare profil: ${profileError.message}`);
    }

    console.log('✅ Profil creat cu succes!');

    console.log('\n🎉 SUCCES! Contul admin a fost creat!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Parolă: ${password}`);
    console.log(`👤 Rol: ${role}`);
    console.log(`🆔 User ID: ${authData.user.id}`);

  } catch (error) {
    console.error('\n❌ EROARE:', error.message);
    process.exit(1);
  }
}

createAdminAccount();
