# 📧 EMAIL TEMPLATES PENTRU SUPABASE - INDEX

## 📋 AI 3 TEMPLATE-URI SEPARATE:

### 1️⃣ **EMAIL_TEMPLATE_CONFIRMARE_INREGISTRARE.html**
📄 Folosit pentru: **Confirm Signup** în Supabase
🎨 Design: Neon cyan/blue
🎯 Scop: Confirmă email-ul după înregistrare
📧 Subject recomandat: `🎉 Confirmă-ți contul EXPO CAR MEETING!`

**Când se trimite:**
- User se înregistrează cu email/parolă
- Supabase trimite automat email de confirmare
- User apasă pe link → contul se activează

---

### 2️⃣ **EMAIL_TEMPLATE_RESET_PASSWORD.html**
📄 Folosit pentru: **Reset Password** în Supabase
🎨 Design: Neon orange/red (urgență)
🎯 Scop: Resetează parola uitată
📧 Subject recomandat: `🔐 Resetare Parolă - EXPO CAR MEETING`

**Când se trimite:**
- User apasă "Ai uitat parola?" în login
- Introduce email-ul
- Supabase trimite link de resetare
- User apasă link → resetează parola

---

### 3️⃣ **EMAIL_TEMPLATE_MAGIC_LINK.html**
📄 Folosit pentru: **Magic Link** în Supabase
🎨 Design: Neon purple/pink
🎯 Scop: Login instant fără parolă
📧 Subject recomandat: `⚡ Link de Conectare Rapidă - EXPO CAR MEETING`

**Când se trimite:**
- User cere "login fără parolă" (Magic Link)
- Supabase trimite link special
- User apasă link → se conectează automat (fără parolă!)

---

## 🔧 CONFIGURARE ÎN SUPABASE:

### **Pasul 1: Deschide Supabase Dashboard**
1. https://supabase.com/dashboard
2. Selectează proiectul EXPO CAR MEETING
3. Settings → Authentication → Email Templates

---

### **Pasul 2: Configurează fiecare template**

#### **A) Confirm Signup**
1. Template: **"Confirm signup"**
2. Subject: `🎉 Confirmă-ți contul EXPO CAR MEETING!`
3. Message Body: Copiază din **EMAIL_TEMPLATE_CONFIRMARE_INREGISTRARE.html**
4. Save

#### **B) Reset Password**
1. Template: **"Reset password"**
2. Subject: `🔐 Resetare Parolă - EXPO CAR MEETING`
3. Message Body: Copiază din **EMAIL_TEMPLATE_RESET_PASSWORD.html**
4. Save

#### **C) Magic Link**
1. Template: **"Magic Link"**
2. Subject: `⚡ Link de Conectare Rapidă - EXPO CAR MEETING`
3. Message Body: Copiază din **EMAIL_TEMPLATE_MAGIC_LINK.html**
4. Save

---

### **Pasul 3: Configurează Redirect URLs**

Settings → Authentication → URL Configuration

**Adaugă:**
```
http://localhost:3000/auth/reset-password
https://expo-car-meeting.vercel.app/auth/reset-password
https://expocarmeeting.ro/auth/reset-password

http://localhost:3000
https://expo-car-meeting.vercel.app
https://expocarmeeting.ro
```

*Adaugă fiecare URL pe linie separată!*

---

## 📂 STRUCTURA FIȘIERELOR:

```
/app/
├── EMAIL_TEMPLATE_CONFIRMARE_INREGISTRARE.html  ← Template #1
├── EMAIL_TEMPLATE_RESET_PASSWORD.html           ← Template #2
├── EMAIL_TEMPLATE_MAGIC_LINK.html               ← Template #3
└── CONFIGURARE_EMAIL_TEMPLATES_SUPABASE.md      ← Ghid detaliat
```

---

## 🎨 PREVIEW DESIGN:

### Template #1 - Confirmare
- Border: **Neon Cyan** (#06b6d4)
- Buton: **Gradient Cyan → Blue**
- Icon: 🎉
- Warning: Link valabil 24h

### Template #2 - Resetare Parolă
- Border: **Neon Orange** (#f97316)
- Buton: **Gradient Orange → Red**
- Icon: 🔐
- Warning: Link valabil 1h

### Template #3 - Magic Link
- Border: **Neon Purple** (#a855f7)
- Buton: **Gradient Purple → Pink**
- Icon: ⚡
- Warning: Link valabil 1h

---

## ✅ CHECKLIST:

- [ ] Am copiat Template #1 în Supabase (Confirm Signup)
- [ ] Am copiat Template #2 în Supabase (Reset Password)
- [ ] Am copiat Template #3 în Supabase (Magic Link)
- [ ] Am adăugat toate Redirect URLs
- [ ] Am testat înregistrare → primit email confirmare
- [ ] Am testat resetare parolă → primit email resetare
- [ ] Toate emailurile arată frumos cu design Cyberpunk! 🎉

---

## 🆘 PROBLEME?

**Q: Nu primesc emailul deloc**
A: Verifică folder SPAM + verifică că "Enable email confirmations" e ON în Supabase

**Q: Link-ul nu funcționează**
A: Verifică că ai adăugat TOATE redirect URLs în Supabase

**Q: Emailul arată urât**
A: Asigură-te că ai copiat ÎNTREG codul HTML (inclusiv `<!DOCTYPE html>`)

---

**GATA! Ai TOT ce îți trebuie! 🚀**
