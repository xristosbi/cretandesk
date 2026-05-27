-- ============================================================
-- CretanDesk — Dev Seed Data
-- Run ONLY in development. Creates test users via Supabase Auth.
-- ============================================================
-- NOTE: Run this via the Supabase Dashboard SQL Editor.
-- Passwords are all: Test1234!
-- ============================================================

-- After creating auth users manually in the Auth dashboard,
-- or via the API, update their profiles like so:

-- Make the first registered user an admin:
-- UPDATE profiles SET role = 'admin', status = 'approved'
-- WHERE email = 'admin@cretandesk.com';

-- Sample partner (after they register):
-- UPDATE profiles SET role = 'partner', status = 'approved'
-- WHERE email = 'partner@cretandesk.com';
-- INSERT INTO partners (id, business_name, afm, phone, description, areas, approved)
-- SELECT id, 'Cretan Sea Adventures', '123456789', '+30 2810 123456',
--        'Premium sea excursions in Crete since 2010.',
--        ARRAY['heraklion', 'chania']::cretan_area[], TRUE
-- FROM profiles WHERE email = 'partner@cretandesk.com';

-- Sample agency (after they register):
-- UPDATE profiles SET role = 'agency', status = 'approved'
-- WHERE email = 'agency@cretandesk.com';
-- INSERT INTO agencies (id, business_name, afm, phone, approved)
-- SELECT id, 'Heraklion Travel Group', '987654321', '+30 2810 654321', TRUE
-- FROM profiles WHERE email = 'agency@cretandesk.com';
