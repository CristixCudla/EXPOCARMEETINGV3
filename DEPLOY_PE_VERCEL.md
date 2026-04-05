# 🚀 GHID COMPLET: DEPLOY EXPO CAR MEETING PE VERCEL

## ✅ PREGĂTIREA (FĂCUT DEJA)
- ✅ next.config.js simplificat pentru Vercel
- ✅ vercel.json creat
- ✅ Logo-ul folosește Supabase Storage URL
- ✅ Fonturile folosesc Google Fonts

---

## 📋 PAS CU PAS - DEPLOY PE VERCEL

### **Pasul 1: Creează cont Vercel (DACĂ NU AI DEJA)**

1. Deschide browser: https://vercel.com/signup
2. Selectează **"Continue with GitHub"** (cel mai simplu)
3. Autentifică-te cu contul tău GitHub
4. Acceptă permisiunile cerute de Vercel

---

### **Pasul 2: Pregătește Repository GitHub**

**IMPORTANT:** Codul trebuie să fie pe GitHub pentru Vercel!

**Opțiunea A - Dacă AI DEJA GITHUB REPO:**
1. Deschide terminal/command prompt LOCAL (pe calculatorul tău)
2. Clonează repo-ul:
   ```bash
   git clone [URL-ul-repo-ului-tau-github]
   cd [numele-folderului]
   ```

**Opțiunea B - Dacă NU AI GitHub repo, CREEAZĂ UNO NOU:**
1. Mergi pe GitHub.com
2. Click pe "+" (sus dreapta) → "New repository"
3. Nume: `expo-car-meeting`
4. Setează **Private** (ca să nu fie public)
5. Click "Create repository"
6. Copiază comenzile de mai jos și rulează-le LOCAL:

```bash
# Creează folder nou LOCAL
mkdir expo-car-meeting
cd expo-car-meeting

# Inițializează git
git init
git branch -M main

# Adaugă remote (înlocuiește USERNAME cu username-ul tău GitHub!)
git remote add origin https://github.com/USERNAME/expo-car-meeting.git
```

---

### **Pasul 3: Copiază codul aplicației în repo GitHub**

**FOARTE IMPORTANT:** Trebuie să copiezi TOATE fișierele din `/app` pe calculatorul tău LOCAL!

**Din Emergent (sau de unde ai codul):**

1. **Descarcă TOATE fișierele** din proiectul Emergent
2. **SAU** folosește "Save to GitHub" din Emergent (dacă ai)
3. **SAU** folosește comanda de mai jos în Emergent terminal:

```bash
# Arhivează tot codul (rulează în Emergent)
cd /app
tar -czf expo-car-meeting-code.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .

# Descarcă arhiva pe calculatorul tău
# Apoi extrage-o în folder-ul repo-ului GitHub local
```

**Lista fișierelor IMPORTANTE de copiat:**
- ✅ `/app` (întreg folderul)
- ✅ `/public` (întreg folderul)
- ✅ `/lib`
- ✅ `next.config.js`
- ✅ `package.json`
- ✅ `tailwind.config.js`
- ✅ `.env` (**SUPER IMPORTANT!**)
- ✅ `vercel.json`
- ❌ **NU COPIA:** `node_modules`, `.next`, `.git`

---

### **Pasul 4: Push codul pe GitHub**

În terminal LOCAL (în folderul repo-ului):

```bash
# Adaugă toate fișierele
git add .

# Commit
git commit -m "Initial commit - Expo Car Meeting"

# Push pe GitHub
git push -u origin main
```

**Dacă întâmpini erori la push:**
```bash
# Dacă cere username/password, folosește Personal Access Token
# GitHub → Settings → Developer settings → Personal access tokens → Generate new token
# Copiază token-ul și folosește-l în loc de parolă
```

---

### **Pasul 5: Deploy pe Vercel (SUPER SIMPLU!)**

1. **Deschide Vercel Dashboard:** https://vercel.com/dashboard

2. **Click pe "Add New..." → "Project"**

3. **Import Git Repository:**
   - Vercel va afișa lista de repo-uri GitHub
   - Găsește `expo-car-meeting`
   - Click pe **"Import"**

4. **Configure Project:**
   - **Framework Preset:** Next.js (detectat automat)
   - **Root Directory:** `./` (lasă default)
   - **Build Command:** `yarn build` (detectat automat)
   - **Output Directory:** `.next` (detectat automat)
   - **Install Command:** `yarn install` (detectat automat)

5. **Environment Variables (FOARTE IMPORTANT!):**
   
   Click pe **"Environment Variables"** și adaugă TOATE variabilele din `.env`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://cipxfkqtwpaxvvelrljh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[copiază din .env]
   SUPABASE_SERVICE_ROLE_KEY=[copiază din .env]
   
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=expocarmeeting@gmail.com
   SMTP_PASS=[copiază din .env - fără ghilimele!]
   SMTP_FROM_EMAIL=expocarmeeting@gmail.com
   SMTP_FROM_NAME=EXPO CAR MEETING
   
   NEXT_PUBLIC_BASE_URL=https://[va fi completat automat după deploy]
   NEXT_PUBLIC_SITE_URL=https://[va fi completat automat după deploy]
   CORS_ORIGINS=*
   ADMIN_EMAIL=admin@expocarmeeting.ro
   ```

   **NOTĂ:** Pentru `SMTP_PASS`, copiază DOAR valoarea (fără ghilimele)!

6. **Click pe "Deploy"** 🚀

---

### **Pasul 6: Așteaptă build-ul (2-4 minute)**

Vercel va:
- ✅ Clona repo-ul
- ✅ Instala dependencies (yarn install)
- ✅ Build aplicația (yarn build)
- ✅ Deploy automat
- ✅ Genera URL public

---

### **Pasul 7: Actualizează URL-urile în Vercel**

După deploy, Vercel îți dă un URL gen: `https://expo-car-meeting.vercel.app`

1. **Copiază URL-ul**
2. **Mergi în Vercel → Settings → Environment Variables**
3. **Editează:**
   - `NEXT_PUBLIC_BASE_URL` → pune URL-ul Vercel
   - `NEXT_PUBLIC_SITE_URL` → pune URL-ul Vercel
4. **Redeploy:** Vercel → Deployments → Click pe ultimul deploy → "Redeploy"

---

### **Pasul 8: Conectează domeniul TĂU (expocarmeeting.ro)**

1. **Vercel Dashboard → Project → Settings → Domains**
2. **Click "Add Domain"**
3. **Scrie:** `expocarmeeting.ro`
4. **Click "Add"**

Vercel îți va da instrucțiuni DNS:

**În panoul de control al domeniului (unde ai cumpărat expocarmeeting.ro):**

Adaugă următoarele DNS records:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**AȘTEPTARE:** DNS propagation (5 minute - 48 ore, de obicei ~1 oră)

---

## ✅ **VERIFICARE FINALĂ**

După deploy, deschide URL-ul Vercel și verifică:
- ✅ Logo Auto Mingiuc apare
- ✅ Fonturile se încarcă corect
- ✅ Login funcționează
- ✅ Dashboard funcționează
- ✅ Emailurile se trimit

---

## 🆘 **PROBLEME COMUNE**

**1. "Build failed" în Vercel:**
- Verifică că ai copiat TOATE fișierele (mai ales `package.json`, `next.config.js`)
- Verifică că nu ai erori de sintaxă în cod
- Citește error log-ul în Vercel

**2. "Application Error" după deploy:**
- Verifică Environment Variables în Vercel
- Asigură-te că SMTP_PASS nu are ghilimele
- Verifică că SUPABASE keys sunt corecte

**3. "Cannot connect to database":**
- Verifică că Supabase URL și keys sunt corecte în Vercel Environment Variables

**4. Fonturile/Logo-ul nu apar:**
- NU AR TREBUI SĂ SE ÎNTÂMPLE! Supabase URL + Google Fonts funcționează 100%
- Dacă totuși nu apar, verifică în browser DevTools (F12) → Console pentru erori

---

## 💡 **SFATURI**

- Vercel deployează AUTOMAT la fiecare push pe GitHub (CI/CD)
- Poți avea **preview deployments** pentru branch-uri
- Vercel oferă **Analytics** gratuit
- **Logs** sunt în timp real în Vercel Dashboard

---

## 📞 **DACĂ AI NEVOIE DE AJUTOR:**

Spune-mi la ce pas ești blocat și îți trimit comenzi exacte!
