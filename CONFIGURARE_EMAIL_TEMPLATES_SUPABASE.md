# 📧 CONFIGURARE EMAIL TEMPLATES ÎN SUPABASE

## 🎯 CE TREBUIE SĂ FACI:

Supabase trimite automat emailuri pentru:
1. **Confirmare înregistrare** (Email Confirmation)
2. **Resetare parolă** (Password Reset)

Dar template-urile default sunt urâte! Hai să le personalizăm cu tema Cyberpunk! 🎨

---

## 📋 PASUL 1: DESCHIDE SUPABASE DASHBOARD

1. Mergi pe: https://supabase.com/dashboard
2. Selectează proiectul: **EXPO CAR MEETING** (sau cum l-ai numit)
3. Click pe ⚙️ **Settings** (jos stânga)
4. Click pe **Authentication** → **Email Templates**

---

## 🎨 PASUL 2: CONFIGUREAZĂ "CONFIRM SIGNUP" (ÎNREGISTRARE)

### În Supabase Dashboard:

1. Selectează template-ul: **"Confirm signup"**
2. **Subject Line:** Pune:
   ```
   🎉 Confirmă-ți contul EXPO CAR MEETING!
   ```

3. **Message Body (HTML):** Șterge tot ce e acolo și **copiază-lipește** conținutul din fișierul:
   ```
   EMAIL_TEMPLATES_SUPABASE.html
   ```
   
   SAU copiază direct de aici (scroll mai jos pentru cod complet)

4. **Preview:** Click pe "Preview" să vezi cum arată
5. **Save:** Click pe "Save" (sus dreapta)

---

## 🔐 PASUL 3: CONFIGUREAZĂ "RESET PASSWORD" (RESETARE PAROLĂ)

### În Supabase Dashboard:

1. Selectează template-ul: **"Reset password"**
2. **Subject Line:** Pune:
   ```
   🔐 Resetare Parolă - EXPO CAR MEETING
   ```

3. **Message Body (HTML):** Șterge tot ce e acolo și **copiază-lipește** conținutul din fișierul:
   ```
   EMAIL_TEMPLATE_RESET_PASSWORD.html
   ```
   
   SAU copiază direct de aici (scroll mai jos pentru cod complet)

4. **Preview:** Click pe "Preview" să vezi cum arată
5. **Save:** Click pe "Save" (sus dreapta)

---

## 🔗 PASUL 4: CONFIGUREAZĂ REDIRECT URLs (IMPORTANT!)

### În Supabase Dashboard:

1. Mergi la: **Settings** → **Authentication** → **URL Configuration**

2. Adaugă în **"Redirect URLs"**:
   ```
   http://localhost:3000/auth/reset-password
   https://expo-car-meeting.vercel.app/auth/reset-password
   https://expocarmeeting.ro/auth/reset-password
   ```
   
   *Adaugă fiecare URL pe o linie separată!*

3. **Site URL:** Pune URL-ul principal:
   ```
   https://expo-car-meeting.vercel.app
   ```
   (sau `https://expocarmeeting.ro` după ce conectezi domeniul)

4. Click **"Save"**

---

## ✅ PASUL 5: TESTEAZĂ!

### Test Confirmare Înregistrare:

1. Deschide aplicația
2. Mergi la `/auth/register`
3. Înregistrează-te cu un email REAL
4. Verifică inbox-ul → Ar trebui să primești email Cyberpunk frumos! 🎉

### Test Resetare Parolă:

1. Deschide aplicația
2. Mergi la `/auth/login`
3. Click pe "Ai uitat parola?"
4. Introdu email-ul
5. Verifică inbox-ul → Ar trebui să primești email de resetare! 🔐

---

## 🎨 PREVIEW EMAIL TEMPLATES

### 📧 TEMPLATE 1: CONFIRMARE ÎNREGISTRARE

```html
[Deschide fișierul EMAIL_TEMPLATES_SUPABASE.html pentru cod complet]
```

**Cum arată:**
- Header: Logo EXPO CAR MEETING cu gradient cyan-pink
- Titlu: "🎉 Bine ai venit!"
- Buton mare: "✓ CONFIRMĂ EMAIL-UL" (gradient cyan-blue)
- Footer: Info eveniment + Warning "Link valabil 24h"
- Design: Neon borders, glow effects, dark background

---

### 🔐 TEMPLATE 2: RESETARE PAROLĂ

```html
[Deschide fișierul EMAIL_TEMPLATE_RESET_PASSWORD.html pentru cod complet]
```

**Cum arată:**
- Header: Logo EXPO CAR MEETING cu gradient cyan-pink
- Titlu: "🔐 Resetare Parolă"
- Buton mare: "🔑 RESETEAZĂ PAROLA" (gradient orange-red)
- Warning Box: "Link valabil 1 oră"
- Info Box: "Sfat pentru parolă puternică"
- Footer: Info eveniment + Note securitate
- Design: Neon orange borders, glow effects, dark background

---

## 🆘 PROBLEME COMUNE

### ❌ "Link-ul nu funcționează când dau click"

**Soluție:**
1. Verifică că ai adăugat TOATE redirect URLs în Supabase
2. Verifică că URL-ul din email match-uiește cu ce ai pus în Supabase
3. Asigură-te că pagina `/auth/reset-password` există în aplicație (✅ am creat-o deja!)

### ❌ "Emailul nu se trimite deloc"

**Soluție:**
1. Verifică folder-ul SPAM
2. În Supabase Dashboard → Settings → Authentication → **"Enable email confirmations"** trebuie să fie ON
3. Verifică că email-ul expeditor este valid

### ❌ "Emailul arată urât / fără culori"

**Soluție:**
1. Asigură-te că ai copiat ÎNTREG codul HTML (inclusiv `<!DOCTYPE html>` și `</html>`)
2. Unii clienți email (ex: Outlook) nu suportă toate CSS-urile → dar majoritatea vor arăta OK
3. Gmail și Apple Mail suportă 100% design-ul

---

## 💡 SFATURI

✅ **DO:**
- Testează emailurile cu adresele tale REALE
- Verifică că link-urile funcționează pe MOBILE și DESKTOP
- Personalizează Subject Line-urile dacă vrei

❌ **DON'T:**
- Nu șterge variabilele `{{ .ConfirmationURL }}` - Supabase le înlocuiește automat!
- Nu modifica prea mult HTML-ul dacă nu știi CSS pentru emailuri (e complicat!)
- Nu uita să salvezi după fiecare modificare!

---

## 📞 DACĂ AI NEVOIE DE AJUTOR

Spune-mi ce problemă întâmpini și te ajut să o rezolvi! 🚀
