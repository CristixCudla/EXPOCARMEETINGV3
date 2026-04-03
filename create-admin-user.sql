-- =====================================================
-- CREATE ADMIN USER FOR TESTING
-- =====================================================
-- Run this in Supabase SQL Editor after creating user in Auth

-- First, create the user in Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User" → "Create new user"
-- 3. Email: admin@expocarmeeting.ro
-- 4. Password: Admin123!
-- 5. ✅ Check "Auto Confirm User"
-- 6. Click "Create User"

-- Then run this SQL to set admin role:
UPDATE public.profiles 
SET role = 'admin', 
    full_name = 'Admin Expo Car'
WHERE email = 'admin@expocarmeeting.ro';

-- Verify the update:
SELECT id, email, role, full_name, created_at 
FROM public.profiles 
WHERE email = 'admin@expocarmeeting.ro';

-- =====================================================
-- CREATE TEST USERS (Optional)
-- =====================================================

-- Create organizer user (after creating in Auth Dashboard):
UPDATE public.profiles 
SET role = 'organizer', 
    full_name = 'Organizer Test'
WHERE email = 'organizer@expocarmeeting.ro';

-- Create regular test user (after creating in Auth Dashboard):
UPDATE public.profiles 
SET role = 'user', 
    full_name = 'Test User'
WHERE email = 'test@expocarmeeting.ro';

-- =====================================================
-- VERIFY ALL USERS
-- =====================================================
SELECT 
  email, 
  role, 
  full_name, 
  created_at::date as registered_date
FROM public.profiles 
ORDER BY created_at DESC;
