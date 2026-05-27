-- ============================================================
-- CretanDesk — Storage Buckets
-- Run after 001_initial_schema.sql
-- ============================================================

-- Partner logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-logos',
  'partner-logos',
  TRUE,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Excursion photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'excursion-photos',
  'excursion-photos',
  TRUE,
  5242880,  -- 5MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────────────────────
-- Storage RLS Policies
-- ──────────────────────────────────────────────────────────────

-- partner-logos: partners upload/update their own logo
CREATE POLICY "partner-logos: partner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'partner-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "partner-logos: partner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'partner-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "partner-logos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-logos');

-- excursion-photos: partners upload photos for their excursions
CREATE POLICY "excursion-photos: partner upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'excursion-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "excursion-photos: partner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'excursion-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "excursion-photos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'excursion-photos');
