-- ============================================================
-- CretanDesk — Initial Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role   AS ENUM ('admin', 'partner', 'agency');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
CREATE TYPE excursion_category AS ENUM ('sea', 'adventure', 'aerial', 'gastronomy', 'culture', 'vip', 'niche');
CREATE TYPE cretan_area AS ENUM ('heraklion', 'chania', 'rethymno', 'lasithi');


-- ============================================================
-- TABLE: profiles  (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id         UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email      TEXT,
  role       user_role,
  status     user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile row on new signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();


-- ============================================================
-- TABLE: partners
-- ============================================================
CREATE TABLE partners (
  id            UUID REFERENCES profiles ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT NOT NULL,
  afm           TEXT,
  phone         TEXT,
  description   TEXT,
  areas         cretan_area[],
  logo_url      TEXT,
  approved      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE: agencies
-- ============================================================
CREATE TABLE agencies (
  id            UUID REFERENCES profiles ON DELETE CASCADE PRIMARY KEY,
  business_name TEXT NOT NULL,
  afm           TEXT,
  gemi          TEXT,
  eot           TEXT,
  phone         TEXT,
  address       TEXT,
  approved      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE: partner_agency_connections
-- ============================================================
CREATE TABLE partner_agency_connections (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES partners ON DELETE CASCADE,
  agency_id  UUID NOT NULL REFERENCES agencies ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (partner_id, agency_id)
);


-- ============================================================
-- TABLE: excursions
-- ============================================================
CREATE TABLE excursions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id       UUID NOT NULL REFERENCES partners ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  category         excursion_category,
  area             cretan_area,
  price_per_person DECIMAL(10,2),
  max_capacity     INTEGER,
  duration_hours   DECIMAL(4,1),
  photos           TEXT[],
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE: availability
-- ============================================================
CREATE TABLE availability (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  excursion_id    UUID NOT NULL REFERENCES excursions ON DELETE CASCADE,
  date            DATE NOT NULL,
  available_slots INTEGER,
  blackout        BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (excursion_id, date)
);


-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE bookings (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id        UUID NOT NULL REFERENCES agencies ON DELETE RESTRICT,
  excursion_id     UUID NOT NULL REFERENCES excursions ON DELETE RESTRICT,
  partner_id       UUID NOT NULL REFERENCES partners ON DELETE RESTRICT,
  date             DATE NOT NULL,
  persons_adults   INTEGER NOT NULL DEFAULT 0,
  persons_children INTEGER NOT NULL DEFAULT 0,
  total_persons    INTEGER GENERATED ALWAYS AS (persons_adults + persons_children) STORED,
  status           booking_status NOT NULL DEFAULT 'pending',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();


-- ============================================================
-- TABLE: service_fees
-- ============================================================
CREATE TABLE service_fees (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id        UUID NOT NULL REFERENCES bookings ON DELETE RESTRICT UNIQUE,
  partner_id        UUID NOT NULL REFERENCES partners ON DELETE RESTRICT,
  persons           INTEGER,
  amount            DECIMAL(10,2),   -- persons * 0.50
  paid              BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_invoice_id TEXT,
  period            TEXT,            -- 'YYYY-MM'
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_partners_approved          ON partners (approved);
CREATE INDEX idx_agencies_approved          ON agencies (approved);
CREATE INDEX idx_excursions_partner         ON excursions (partner_id);
CREATE INDEX idx_excursions_active          ON excursions (active);
CREATE INDEX idx_excursions_area            ON excursions (area);
CREATE INDEX idx_excursions_category        ON excursions (category);
CREATE INDEX idx_availability_excursion     ON availability (excursion_id);
CREATE INDEX idx_availability_date          ON availability (date);
CREATE INDEX idx_bookings_agency            ON bookings (agency_id);
CREATE INDEX idx_bookings_partner           ON bookings (partner_id);
CREATE INDEX idx_bookings_excursion         ON bookings (excursion_id);
CREATE INDEX idx_bookings_status            ON bookings (status);
CREATE INDEX idx_bookings_date              ON bookings (date);
CREATE INDEX idx_service_fees_partner       ON service_fees (partner_id);
CREATE INDEX idx_service_fees_paid          ON service_fees (paid);
CREATE INDEX idx_service_fees_period        ON service_fees (period);
CREATE INDEX idx_connections_partner        ON partner_agency_connections (partner_id);
CREATE INDEX idx_connections_agency         ON partner_agency_connections (agency_id);


-- ============================================================
-- HELPER: get current user role
-- ============================================================
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION auth_status()
RETURNS user_status
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT status FROM public.profiles WHERE id = auth.uid();
$$;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_agency_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE excursions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability              ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_fees              ENABLE ROW LEVEL SECURITY;


-- ──────────────────────────────────────────────────────────────
-- profiles
-- ──────────────────────────────────────────────────────────────
-- Own profile: full access
CREATE POLICY "profiles: own read"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: own update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin: see all
CREATE POLICY "profiles: admin read all"
  ON profiles FOR SELECT
  USING (auth_role() = 'admin');

CREATE POLICY "profiles: admin update all"
  ON profiles FOR UPDATE
  USING (auth_role() = 'admin');


-- ──────────────────────────────────────────────────────────────
-- partners
-- ──────────────────────────────────────────────────────────────
CREATE POLICY "partners: own read"
  ON partners FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "partners: own update"
  ON partners FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "partners: own insert"
  ON partners FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Agencies see approved partners they are connected to
CREATE POLICY "partners: agency sees connected approved"
  ON partners FOR SELECT
  USING (
    approved = TRUE
    AND auth_role() = 'agency'
    AND EXISTS (
      SELECT 1 FROM partner_agency_connections pac
      WHERE pac.partner_id = partners.id
        AND pac.agency_id  = auth.uid()
        AND pac.status     = 'approved'
    )
  );

-- Admin: full access
CREATE POLICY "partners: admin all"
  ON partners FOR ALL
  USING (auth_role() = 'admin');


-- ──────────────────────────────────────────────────────────────
-- agencies
-- ──────────────────────────────────────────────────────────────
CREATE POLICY "agencies: own read"
  ON agencies FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "agencies: own update"
  ON agencies FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "agencies: own insert"
  ON agencies FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Partners see agencies they are connected to
CREATE POLICY "agencies: partner sees connected"
  ON agencies FOR SELECT
  USING (
    auth_role() = 'partner'
    AND EXISTS (
      SELECT 1 FROM partner_agency_connections pac
      WHERE pac.agency_id  = agencies.id
        AND pac.partner_id = auth.uid()
        AND pac.status     = 'approved'
    )
  );

-- Admin: full access
CREATE POLICY "agencies: admin all"
  ON agencies FOR ALL
  USING (auth_role() = 'admin');


-- ──────────────────────────────────────────────────────────────
-- partner_agency_connections
-- ──────────────────────────────────────────────────────────────
-- Partners manage their own connections
CREATE POLICY "connections: partner manage"
  ON partner_agency_connections FOR ALL
  USING (auth.uid() = partner_id)
  WITH CHECK (auth.uid() = partner_id);

-- Agencies view their own connections
CREATE POLICY "connections: agency read"
  ON partner_agency_connections FOR SELECT
  USING (auth.uid() = agency_id);

-- Admin: full access
CREATE POLICY "connections: admin all"
  ON partner_agency_connections FOR ALL
  USING (auth_role() = 'admin');


-- ──────────────────────────────────────────────────────────────
-- excursions
-- ──────────────────────────────────────────────────────────────
-- Partners manage their own excursions
CREATE POLICY "excursions: partner manage"
  ON excursions FOR ALL
  USING (auth.uid() = partner_id)
  WITH CHECK (auth.uid() = partner_id);

-- Agencies browse active excursions from approved connected partners
CREATE POLICY "excursions: agency read connected"
  ON excursions FOR SELECT
  USING (
    active = TRUE
    AND auth_role() = 'agency'
    AND auth_status() = 'approved'
    AND EXISTS (
      SELECT 1 FROM partner_agency_connections pac
      WHERE pac.partner_id = excursions.partner_id
        AND pac.agency_id  = auth.uid()
        AND pac.status     = 'approved'
    )
  );

-- Admin: full access
CREATE POLICY "excursions: admin all"
  ON excursions FOR ALL
  USING (auth_role() = 'admin');


-- ──────────────────────────────────────────────────────────────
-- availability
-- ──────────────────────────────────────────────────────────────
-- Partners manage availability for their excursions
CREATE POLICY "availability: partner manage"
  ON availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM excursions e
      WHERE e.id = availability.excursion_id AND e.partner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM excursions e
      WHERE e.id = availability.excursion_id AND e.partner_id = auth.uid()
    )
  );

-- Agencies read availability of accessible excursions
CREATE POLICY "availability: agency read"
  ON availability FOR SELECT
  USING (
    auth_role() = 'agency'
    AND auth_status() = 'approved'
    AND EXISTS (
      SELECT 1
      FROM excursions e
      JOIN partner_agency_connections pac ON pac.partner_id = e.partner_id
      WHERE e.id         = availability.excursion_id
        AND e.active     = TRUE
        AND pac.agency_id = auth.uid()
        AND pac.status   = 'approved'
    )
  );

-- Admin: full access
CREATE POLICY "availability: admin all"
  ON availability FOR ALL
  USING (auth_role() = 'admin');


-- ──────────────────────────────────────────────────────────────
-- bookings
-- ──────────────────────────────────────────────────────────────
-- Agencies create and read their own bookings
CREATE POLICY "bookings: agency create"
  ON bookings FOR INSERT
  WITH CHECK (
    auth.uid() = agency_id
    AND auth_status() = 'approved'
  );

CREATE POLICY "bookings: agency read own"
  ON bookings FOR SELECT
  USING (auth.uid() = agency_id);

-- Partners read and update bookings for their excursions
CREATE POLICY "bookings: partner read own"
  ON bookings FOR SELECT
  USING (auth.uid() = partner_id);

CREATE POLICY "bookings: partner update status"
  ON bookings FOR UPDATE
  USING (auth.uid() = partner_id)
  WITH CHECK (auth.uid() = partner_id);

-- Admin: full access
CREATE POLICY "bookings: admin all"
  ON bookings FOR ALL
  USING (auth_role() = 'admin');


-- ──────────────────────────────────────────────────────────────
-- service_fees
-- ──────────────────────────────────────────────────────────────
-- Partners read their own fees
CREATE POLICY "service_fees: partner read own"
  ON service_fees FOR SELECT
  USING (auth.uid() = partner_id);

-- Admin: full access
CREATE POLICY "service_fees: admin all"
  ON service_fees FOR ALL
  USING (auth_role() = 'admin');

-- Service role (server-side API) inserts fees on booking completion
-- This is handled via SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
