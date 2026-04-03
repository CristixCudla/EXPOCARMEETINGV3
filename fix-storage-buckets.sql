-- =====================================================
-- FIX SUPABASE STORAGE BUCKETS
-- =====================================================
-- Run this in Supabase SQL Editor to create missing buckets

-- Create car-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-images',
  'car-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Create sponsor-logos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sponsor-logos',
  'sponsor-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Verify buckets were created
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id IN ('car-images', 'sponsor-logos');

-- =====================================================
-- STORAGE POLICIES (if not already exist)
-- =====================================================

-- Drop existing policies if they exist (to recreate)
DROP POLICY IF EXISTS "Anyone can view car images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own car images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view sponsor logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload sponsor logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete sponsor logos" ON storage.objects;

-- Car images - Anyone can view
CREATE POLICY "Anyone can view car images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'car-images');

-- Car images - Authenticated users can upload
CREATE POLICY "Authenticated users can upload car images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'car-images' 
    AND auth.role() = 'authenticated'
  );

-- Car images - Users can delete their own
CREATE POLICY "Users can delete own car images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'car-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Sponsor logos - Anyone can view
CREATE POLICY "Anyone can view sponsor logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sponsor-logos');

-- Sponsor logos - Admins can upload
CREATE POLICY "Admins can upload sponsor logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'sponsor-logos' 
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Sponsor logos - Admins can delete
CREATE POLICY "Admins can delete sponsor logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'sponsor-logos' 
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Verify policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%car%' OR policyname LIKE '%sponsor%';
