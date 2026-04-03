-- =====================================================
-- EXPO CAR MEETING - COMPLETE SUPABASE MIGRATION
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- Database: PostgreSQL with Supabase Extensions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (extends auth.users)
-- =====================================================
-- We'll use a profile table to extend Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'organizer', 'user')),
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. CARS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  description TEXT,
  images TEXT[] DEFAULT '{}', -- Array of image URLs (max 5)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  is_best_car_nominee BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. VOTES TABLE (Best Car of the Show)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id) -- One vote per user CONSTRAINT
);

-- =====================================================
-- 4. TICKETS TABLE (Support Tickets)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 5. TICKET MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 6. SPONSORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website_url TEXT,
  logo_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 7. EVENT SCHEDULE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.event_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_schedule ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================
-- Users can view all profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- CARS POLICIES
-- =====================================================
-- Everyone can view accepted cars and best car nominees
CREATE POLICY "Accepted cars are viewable by everyone"
  ON public.cars FOR SELECT
  USING (status = 'accepted' OR is_best_car_nominee = true OR auth.uid() = user_id);

-- Users can insert their own cars
CREATE POLICY "Users can register own cars"
  ON public.cars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own cars
CREATE POLICY "Users can view own cars"
  ON public.cars FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can update any car (status, is_best_car_nominee)
CREATE POLICY "Admins can update cars"
  ON public.cars FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can view all cars
CREATE POLICY "Admins can view all cars"
  ON public.cars FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- VOTES POLICIES
-- =====================================================
-- Users can insert their own vote (ONCE)
CREATE POLICY "Users can vote once"
  ON public.votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND NOT EXISTS (
      SELECT 1 FROM public.votes WHERE votes.user_id = auth.uid()
    )
  );

-- Users can view their own vote
CREATE POLICY "Users can view own vote"
  ON public.votes FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all votes
CREATE POLICY "Admins can view all votes"
  ON public.votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Everyone can count votes (for display)
CREATE POLICY "Everyone can count votes"
  ON public.votes FOR SELECT
  USING (true);

-- =====================================================
-- TICKETS POLICIES
-- =====================================================
-- Users can create their own tickets
CREATE POLICY "Users can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON public.tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Admins and Organizers can view all tickets
CREATE POLICY "Admins and Organizers can view all tickets"
  ON public.tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'organizer')
    )
  );

-- Admins and Organizers can update tickets (status)
CREATE POLICY "Admins and Organizers can update tickets"
  ON public.tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'organizer')
    )
  );

-- =====================================================
-- TICKET MESSAGES POLICIES
-- =====================================================
-- Users can send messages to their own tickets
CREATE POLICY "Users can send messages to own tickets"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_id AND tickets.user_id = auth.uid()
    )
  );

-- Admins and Organizers can send messages to any ticket
CREATE POLICY "Admins and Organizers can send messages"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'organizer')
    )
  );

-- Users can view messages from their own tickets
CREATE POLICY "Users can view messages from own tickets"
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_id AND tickets.user_id = auth.uid()
    )
  );

-- Admins and Organizers can view all messages
CREATE POLICY "Admins and Organizers can view all messages"
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'organizer')
    )
  );

-- =====================================================
-- SPONSORS POLICIES
-- =====================================================
-- Everyone can view sponsors
CREATE POLICY "Sponsors are viewable by everyone"
  ON public.sponsors FOR SELECT
  USING (true);

-- Admins can insert sponsors
CREATE POLICY "Admins can insert sponsors"
  ON public.sponsors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can update sponsors
CREATE POLICY "Admins can update sponsors"
  ON public.sponsors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can delete sponsors
CREATE POLICY "Admins can delete sponsors"
  ON public.sponsors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- EVENT SCHEDULE POLICIES
-- =====================================================
-- Everyone can view event schedule
CREATE POLICY "Event schedule is viewable by everyone"
  ON public.event_schedule FOR SELECT
  USING (true);

-- Admins can manage event schedule
CREATE POLICY "Admins can insert event schedule"
  ON public.event_schedule FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update event schedule"
  ON public.event_schedule FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete event schedule"
  ON public.event_schedule FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    'user', -- Default role
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at on all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_event_schedule_updated_at
  BEFORE UPDATE ON public.event_schedule
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
-- Create storage buckets for car images and sponsor logos
-- Note: Run these commands in Supabase Dashboard > Storage or via SQL

-- Car images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

-- Sponsor logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsor-logos', 'sponsor-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for car-images bucket
CREATE POLICY "Anyone can view car images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'car-images');

CREATE POLICY "Authenticated users can upload car images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'car-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own car images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'car-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for sponsor-logos bucket
CREATE POLICY "Anyone can view sponsor logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sponsor-logos');

CREATE POLICY "Admins can upload sponsor logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'sponsor-logos' 
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete sponsor logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'sponsor-logos' 
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_cars_user_id ON public.cars(user_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON public.cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_is_best_car_nominee ON public.cars(is_best_car_nominee);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_car_id ON public.votes(car_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_event_schedule_date ON public.event_schedule(date);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Insert sample event schedule
INSERT INTO public.event_schedule (date, time, title, description, display_order)
VALUES 
  ('2026-06-06', '10:00', 'Deschiderea Evenimentului', 'Evenimentul începe cu o ceremonie de deschidere spectaculoasă', 1),
  ('2026-06-06', '12:00', 'Show Auto & Concursuri', 'Competiții pe măsură și premii pentru cele mai frumoase mașini', 2),
  ('2026-06-07', '14:00', 'Votarea Best Car of the Show', 'Participanții votează pentru cea mai bună mașină', 3),
  ('2026-06-07', '18:00', 'Închiderea și Premierea Câștigătorilor', 'Ceremonie de premiere și închidere', 4)
ON CONFLICT DO NOTHING;

-- Insert sample sponsor
INSERT INTO public.sponsors (name, website_url, logo_url, display_order)
VALUES 
  ('Auto Mingiuc', 'https://www.tractarifalticeni.ro', 'https://cipxfkqtwpaxvvelrljh.supabase.co/storage/v1/object/public/sponsor-logos/auto-mingiuc.png', 1)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- Migration completed successfully!
-- Next steps:
-- 1. Create storage buckets in Supabase Dashboard if not auto-created
-- 2. Configure your Next.js app with environment variables
-- 3. Test authentication and data flows
