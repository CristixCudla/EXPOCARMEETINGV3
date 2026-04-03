# 🚗 Expo Car Meeting 2026 - Full-Stack Application

![Expo Car Meeting](https://img.shields.io/badge/Status-Production%20Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Resend](https://img.shields.io/badge/Resend-Email-blue)

> Platformă modernă pentru gestionarea evenimentului auto Expo Car Meeting - Fălticeni, 6-7 Iunie 2026

## 🎯 Despre Proiect

Aplicație full-stack pentru managementul evenimentului auto, cu:
- ✅ **Înregistrare mașini** cu upload imagini (max 5)
- ✅ **Sistem votare** "Best Car of the Show" (1 vot/utilizator)
- ✅ **Dashboard Admin** complet cu toate funcționalitățile
- ✅ **Support Tickets** cu sistem de chat real-time
- ✅ **Email notifications** automate
- ✅ **Design modern 3D** cu animații Framer Motion

---

## 🏗️ Arhitectură

### **Tech Stack:**
- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js API Routes, Supabase (PostgreSQL + Auth + Storage)
- **Email:** Resend API
- **Deployment:** Kubernetes + Docker

### **Structură Proiect:**
```
/app
├── app/
│   ├── api/[[...path]]/route.js    # API Routes (all endpoints)
│   ├── page.js                      # Homepage
│   ├── layout.js                    # Root layout
│   ├── globals.css                  # Global styles + animations
│   ├── auth/
│   │   ├── login/page.js            # Login page
│   │   └── register/page.js         # Registration page
│   ├── register-car/page.js         # Car registration form
│   ├── tickets/page.js              # Support tickets
│   └── dashboard/page.js            # Admin/Organizer dashboard
├── lib/
│   ├── supabase.js                  # Supabase client
│   ├── supabase-server.js           # Supabase admin client
│   └── resend.js                    # Email templates + sender
├── components/ui/                   # shadcn/ui components
├── supabase-migration.sql           # Database schema
├── create-admin-user.sql            # Admin user setup
├── TESTING_GUIDE.md                 # Complete testing guide
└── .env                             # Environment variables
```

---

## 🚀 Quick Start

### **1. Prerequisites:**
- Node.js 18+
- Yarn package manager
- Supabase account
- Resend account

### **2. Setup Database:**

1. **Creează proiect Supabase:** https://supabase.com
2. **Rulează migration:**
   - Deschide **SQL Editor** în Supabase Dashboard
   - Copiază conținutul din `supabase-migration.sql`
   - Rulează scriptul

3. **Verifică tabelele create:**
   - Mergi la **Table Editor**
   - Ar trebui să vezi: `profiles`, `cars`, `votes`, `tickets`, `ticket_messages`, `sponsors`, `event_schedule`

### **3. Configure Environment:**

Fișierul `.env` este deja configurat cu:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cipxfkqtwpaxvvelrljh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Resend
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@expocarmeeting.ro

# App
NEXT_PUBLIC_BASE_URL=https://modernized-webapp.preview.emergentagent.com
```

### **4. Install & Run:**

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Open browser
# https://modernized-webapp.preview.emergentagent.com
```

### **5. Create Admin User:**

1. **În Supabase Dashboard:**
   - Mergi la **Authentication > Users**
   - Click **"Add User"**
   - Email: `admin@expocarmeeting.ro`
   - Password: `Admin123!`
   - ✅ **Bifează "Auto Confirm User"**
   - Click **"Create User"**

2. **În SQL Editor:**
   ```sql
   UPDATE public.profiles 
   SET role = 'admin', full_name = 'Admin User'
   WHERE email = 'admin@expocarmeeting.ro';
   ```

---

## 📚 Features & Functionality

### 🏠 **Public Homepage**
- Hero section cu animații Framer Motion
- Logo animat cu glow effects
- Event schedule dinamic
- Best Car voting section (3 mașini)
- Sponsors showcase
- Mobile-responsive design

### 🔐 **Authentication**
- Sign Up / Sign In
- Password Reset
- Auto-create user profile (via Supabase trigger)
- Role-based access (user, organizer, admin)

### 🚗 **Car Registration** (Users)
- Form cu validare completă
- Upload maxim 5 imagini
- Preview imagini înainte de upload
- Status tracking (pending, accepted, rejected)
- Email notifications la aprobare/respingere

### 🏆 **Voting System**
- Best Car of the Show
- Constraint: 1 vot per utilizator
- Real-time vote counting
- Visual feedback pentru vot înregistrat

### 🎫 **Support Tickets**
- Creare ticket cu subiect + mesaj
- Chat-like interface
- Notificări email la reply
- Acces admin și organizer

### 👨‍💼 **Admin Dashboard**
Full access la:
- **Users:** Vizualizare toți utilizatorii
- **Cars Management:** 
  - Aprobare/respingere mașini
  - Email automat la owner
- **Best Car Selection:**
  - Selectează max 3 mașini pentru votare
  - Toggle on/off best car nominee
- **Event Schedule Builder:**
  - CRUD complet
  - Ordine custom
- **Sponsors Management:**
  - CRUD complet
  - Logo upload
- **Support Tickets:**
  - Vezi toate ticket-urile
  - Reply în chat interface

### 👔 **Organizer Dashboard**
Limited access:
- **Support Tickets only**
- Nu poate vedea: users, cars, voting, schedule, sponsors

---

## 🔒 Security & RLS

### **Row Level Security (RLS) Policies:**

**Profiles:**
- Toată lumea poate vedea profiluri
- Utilizatorii pot edita doar propriul profil

**Cars:**
- Public: Doar mașini acceptate și best car nominees
- Users: Propriile mașini (orice status)
- Admins: Toate mașinile

**Votes:**
- Insert: Doar 1 vot per user (UNIQUE constraint)
- Select: Doar propriul vot + counting pentru display

**Tickets:**
- Users: Doar propriile tickets
- Admin/Organizer: Toate tickets

**Event Schedule & Sponsors:**
- Public: Read access
- Admin: Full CRUD

---

## 📧 Email Notifications (Resend)

### **Templates configurate:**

1. **Car Accepted**
   - Trigger: Admin acceptă mașină
   - To: User (owner mașină)
   - Subject: "Mașina ta a fost acceptată! 🎉"

2. **Car Rejected**
   - Trigger: Admin respinge mașină
   - To: User (owner mașină)
   - Subject: "Status înregistrare mașină"

3. **New Ticket**
   - Trigger: User creează ticket
   - To: Admin email
   - Subject: "Mesaj ticket"

4. **Ticket Reply (Admin → User)**
   - Trigger: Admin/Organizer răspunde
   - To: User (ticket owner)
   - Subject: "MESAJ TICKET:"

5. **Ticket Reply (User → Admin)**
   - Trigger: User răspunde
   - To: Admin email
   - Subject: "Mesaj ticket"

---

## 🧪 Testing

Consultă **TESTING_GUIDE.md** pentru:
- Setup utilizatori test
- Scenarii de testare complete
- Checklist funcționalități
- Teste de securitate

### **Quick Test:**
```bash
# Health check
curl http://localhost:3000/api?path=/health

# Expected: {"status":"ok"}
```

---

## 📊 Database Schema

### **Tables:**

**profiles** (extends auth.users)
- id, email, role, full_name, created_at, updated_at

**cars**
- id, user_id, make, model, year, description
- images (TEXT[]), status, is_best_car_nominee

**votes**
- id, user_id, car_id
- UNIQUE(user_id) - one vote per user

**tickets**
- id, user_id, subject, status

**ticket_messages**
- id, ticket_id, sender_id, message

**event_schedule**
- id, date, time, title, description, display_order

**sponsors**
- id, name, website_url, logo_url, display_order

### **Storage Buckets:**
- `car-images` - Imagini mașini (public)
- `sponsor-logos` - Logo-uri sponsori (public)

---

## 🎨 Design System

### **Colors:**
- Primary: Cyan (#00ffff)
- Secondary: Pink (#ff0080)
- Accent: Orange (#ff8c00)
- Background: Dark gradient (#0a0a0a → #1a1a2e → #16213e)

### **Animations:**
- Framer Motion pentru page transitions
- Glow effects pe logo și buttons
- Hover effects pe cards
- Smooth scroll animations

### **Typography:**
- Font: Inter (Google Fonts)
- Gradient text effects
- Responsive font sizes

---

## 🚀 Deployment

### **Production Checklist:**

- [ ] Configurează Supabase production URL
- [ ] Setup Resend custom domain
- [ ] Creează admin user principal
- [ ] Adaugă evenimente în schedule
- [ ] Adaugă sponsori
- [ ] Testează email notifications
- [ ] Configure rate limiting
- [ ] Setup database backups
- [ ] SSL certificates
- [ ] CDN pentru imagini

### **Environment Variables (Production):**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@expocarmeeting.ro
NEXT_PUBLIC_BASE_URL=https://expocarmeeting.ro
```

---

## 📝 API Endpoints

### **Public:**
- `GET /api?path=/health` - Health check

### **Auth:**
- `POST /api` `{"path": "/auth/login"}` - Login
- `POST /api` `{"path": "/auth/register"}` - Register
- `POST /api` `{"path": "/auth/reset-password"}` - Reset password

### **Cars:**
- `POST /api` `{"path": "/cars/register"}` - Register car
- `POST /api` `{"path": "/cars/update-status"}` - Update status (Admin)
- `POST /api` `{"path": "/cars/toggle-best-car"}` - Toggle nominee (Admin)

### **Voting:**
- `POST /api` `{"path": "/votes/cast"}` - Cast vote

### **Tickets:**
- `POST /api` `{"path": "/tickets/create"}` - Create ticket
- `POST /api` `{"path": "/tickets/reply"}` - Reply to ticket

### **Schedule (Admin):**
- `POST /api` `{"path": "/schedule/create"}` - Create event
- `POST /api` `{"path": "/schedule/update"}` - Update event
- `POST /api` `{"path": "/schedule/delete"}` - Delete event

### **Sponsors (Admin):**
- `POST /api` `{"path": "/sponsors/create"}` - Create sponsor
- `POST /api` `{"path": "/sponsors/update"}` - Update sponsor
- `POST /api` `{"path": "/sponsors/delete"}` - Delete sponsor

---

## 🐛 Troubleshooting

### **Problem: Email rate limiting**
**Solution:** În Supabase Dashboard:
- Auth > Settings > Enable "Auto Confirm User"
- Sau dezactivează "Enable email confirmations"

### **Problem: Images not uploading**
**Solution:** Verifică:
- Storage buckets sunt create
- RLS policies permit upload
- File size < 5MB

### **Problem: Can't access dashboard**
**Solution:** Verifică:
- User role în database: `SELECT role FROM profiles WHERE email = 'your@email.com'`
- Doar admin și organizer au acces

---

## 📞 Support

Pentru probleme tehnice:
1. Check logs: `/var/log/supervisor/nextjs.out.log`
2. Check Supabase logs: Dashboard > Logs
3. Check browser console

---

## 📄 License

© 2026 Expo Car Meeting. Toate drepturile rezervate.

---

## 🙏 Credits

- **Design & Development:** Built with Next.js, Supabase, Resend
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **Icons:** Lucide React

---

**Happy Coding! 🚀**
