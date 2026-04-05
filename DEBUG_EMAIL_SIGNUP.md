# 🔍 DEBUG: DE CE NU PRIMESC EMAIL DE SIGN UP?

## ✅ **VERIFICĂRI NECESARE ÎN SUPABASE:**

### **1. Verifică dacă Email Confirmation este ACTIVAT:**

1. **Deschide Supabase Dashboard:** https://supabase.com/dashboard
2. **Settings** (jos stânga) → **Authentication**
3. **Email Auth** tab
4. Verifică setarea **"Enable email confirmations"**:
   - **Trebuie să fie ON** (activat) ✅
   - Dacă este OFF → activeaz-o!

---

### **2. Verifică Email Templates:**

1. **Settings** → **Authentication** → **Email Templates**
2. Verifică template-ul **"Confirm signup"**
3. **Subject** și **Body** trebuie să fie completate
4. Verifică că există `{{ .ConfirmationURL }}` în template

**NOTĂ:** Dacă nu ai configurat încă template-urile personalizate Cyberpunk, Supabase folosește template-ul default (care e urât dar funcționează).

---

### **3. Verifică SMTP Provider (ce folosește Supabase):**

1. **Settings** → **Authentication** → **SMTP Settings**
2. Verifică ce provider folosește:
   - **Default:** Supabase folosește propriul SMTP (gratuit, dar limitat)
   - **Custom:** Poți configura Gmail SMTP (dar NU e nevoie pentru sign up!)

**IMPORTANT:** Pentru sign up, LASĂ pe Default Supabase SMTP!

---

### **4. Verifică Email Rate Limits:**

Supabase gratuit (Free Tier) are limite:
- **Max 3-4 emailuri/oră** per user
- Dacă ai făcut multe sign up-uri recent → așteaptă 1 oră!

---

### **5. Verifică SPAM Folder:**

- Emailurile de la Supabase pot ajunge în SPAM!
- Verifică folder-ul Spam/Junk în inbox

---

## 🧪 **TEST RAPID:**

### **Încearcă să te înregistrezi din nou:**

1. **Deschide aplicația** → `/auth/register`
2. **Înregistrează-te** cu un email NOU (nu unul folosit deja!)
3. **Verifică:**
   - Consolă browser (F12) → erori?
   - Inbox email → primit ceva?
   - Spam folder → primit ceva?

### **Verifică în Supabase Dashboard:**

1. **Authentication** → **Users**
2. Găsește user-ul nou creat
3. Verifică **"Email Confirmed"** column:
   - **Dacă e FALSE** → email nu a fost confirmat (emailul nu a fost trimis SAU nu a fost deschis link-ul)
   - **Dacă e TRUE** → email a fost confirmat (user a dat click pe link)

---

## 🔧 **SOLUȚII:**

### **SOLUȚIE 1: Activează Email Confirmations**
1. Supabase Dashboard → Settings → Authentication → Email Auth
2. **Enable email confirmations** → ON
3. Save

### **SOLUȚIE 2: Configurează Template-ul Confirm Signup**
1. Settings → Authentication → Email Templates → "Confirm signup"
2. Copiază template-ul din `EMAIL_TEMPLATE_CONFIRMARE_INREGISTRARE.html`
3. Save

### **SOLUȚIE 3: Verifică Redirect URL**
1. Settings → Authentication → URL Configuration
2. **Site URL:** Pune URL-ul aplicației tale (ex: `http://localhost:3000`)
3. **Redirect URLs:** Adaugă:
   ```
   http://localhost:3000
   http://localhost:3000/auth/login
   https://expo-car-meeting.vercel.app
   ```

### **SOLUȚIE 4: Dezactivează Email Confirmation (TEMPORAR pentru test)**
**Doar pentru DEBUG! NU pentru producție!**

1. Settings → Authentication → Email Auth
2. **Enable email confirmations** → OFF
3. Încearcă sign up din nou → ar trebui să funcționeze fără email

**Dar apoi REACTIVEAZĂ pentru producție!**

---

## 📧 **CE EMAILURI FOLOSESC CE:**

### **SUPABASE NATIVE (AUTOMAT):**
- ✉️ Sign Up Confirmation
- ✉️ Password Reset
- ✉️ Magic Link
- ✉️ Email Change

### **GMAIL SMTP (MANUAL - prin Nodemailer):**
- ✉️ Ticket Created (notificare admin)
- ✉️ Ticket Reply (notificare user/admin)
- ✉️ Car Approved (notificare user)
- ✉️ Car Rejected (notificare user)

---

## 🆘 **DACĂ ÎNCĂ NU FUNCȚIONEAZĂ:**

**Spune-mi:**
1. Ce apare în browser console când faci sign up? (F12 → Console)
2. Ce setări ai în Supabase → Authentication → Email Auth?
3. User-ul apare în Supabase → Authentication → Users?
4. Ce email folosești pentru test? (verifică că nu e unul folosit deja)

**Îți trimit fix exact pentru problema ta!** 🚀
