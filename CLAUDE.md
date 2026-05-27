# CretanDesk — Claude Code Master Prompt

## Project Overview

Build **CretanDesk** — a B2B SaaS marketplace connecting Travel Agencies with Experience Providers (Partners) in Crete, Greece. This is a production-ready web application.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database + Auth + Storage:** Supabase
- **Payments:** Stripe (Invoicing API)
- **Email:** Resend
- **Deployment:** Vercel
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui

---

## Brand

- **Name:** CretanDesk
- **Tagline:** Crete's Experience Marketplace
- **Colors:**
  - Primary Navy: `#1B3A5C`
  - Accent Gold: `#E8A020`
  - Background: `#F7F8FA`
  - Success: `#2D9B6F`
  - Danger: `#D94040`
  - Muted text: `#6B7A8D`
- **Fonts:** Playfair Display (headings/logo) + DM Sans (UI)

---

## User Roles

1. **ADMIN** — Full platform control
2. **PARTNER** — Experience provider (excursions)
3. **AGENCY** — Travel agency (books excursions)

---

## Database Schema (Supabase / PostgreSQL)

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  role TEXT CHECK (role IN ('admin', 'partner', 'agency')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner profiles
CREATE TABLE partners (
  id UUID REFERENCES profiles PRIMARY KEY,
  business_name TEXT NOT NULL,
  afm TEXT,
  phone TEXT,
  description TEXT,
  areas TEXT[], -- ['heraklion', 'chania', 'rethymno', 'lasithi']
  logo_url TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agency profiles
CREATE TABLE agencies (
  id UUID REFERENCES profiles PRIMARY KEY,
  business_name TEXT NOT NULL,
  afm TEXT,
  gemi TEXT,
  eot TEXT,
  phone TEXT,
  address TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner <-> Agency relationships
CREATE TABLE partner_agency_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES partners,
  agency_id UUID REFERENCES agencies,
  status TEXT DEFAULT 'approved', -- partners choose which agencies they work with
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Excursions
CREATE TABLE excursions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES partners,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('sea', 'adventure', 'aerial', 'gastronomy', 'culture', 'vip', 'niche')),
  area TEXT CHECK (area IN ('heraklion', 'chania', 'rethymno', 'lasithi')),
  price_per_person DECIMAL(10,2),
  max_capacity INTEGER, -- slots per day
  duration_hours DECIMAL(4,1),
  photos TEXT[], -- Supabase Storage URLs
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability per day
CREATE TABLE availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  excursion_id UUID REFERENCES excursions,
  date DATE NOT NULL,
  available_slots INTEGER,
  blackout BOOLEAN DEFAULT FALSE,
  UNIQUE(excursion_id, date)
);

-- Bookings
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES agencies,
  excursion_id UUID REFERENCES excursions,
  partner_id UUID REFERENCES partners,
  date DATE NOT NULL,
  persons_adults INTEGER DEFAULT 0,
  persons_children INTEGER DEFAULT 0,
  total_persons INTEGER GENERATED ALWAYS AS (persons_adults + persons_children) STORED,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Fees (0.50€ per person, triggered on completed)
CREATE TABLE service_fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings UNIQUE,
  partner_id UUID REFERENCES partners,
  persons INTEGER,
  amount DECIMAL(10,2), -- persons * 0.50
  paid BOOLEAN DEFAULT FALSE,
  stripe_invoice_id TEXT,
  period TEXT, -- 'YYYY-MM' for monthly settlement
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Application Structure

```
cretandesk/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Landing page
│   │   ├── register/
│   │   │   ├── agency/page.tsx
│   │   │   └── partner/page.tsx
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Shared dashboard layout + sidebar
│   │   ├── partner/
│   │   │   ├── page.tsx               # Overview + analytics
│   │   │   ├── excursions/
│   │   │   │   ├── page.tsx           # List excursions
│   │   │   │   └── new/page.tsx       # Create excursion form
│   │   │   ├── bookings/page.tsx      # Incoming requests + Accept/Decline
│   │   │   ├── agencies/page.tsx      # Approved agency list
│   │   │   ├── payments/page.tsx      # Fee tracking
│   │   │   └── profile/page.tsx
│   │   ├── agency/
│   │   │   ├── page.tsx               # Overview + calendar
│   │   │   ├── excursions/page.tsx    # Browse & request
│   │   │   ├── bookings/page.tsx      # My requests history
│   │   │   ├── partners/page.tsx      # Approved partners
│   │   │   └── profile/page.tsx
│   │   └── admin/
│   │       ├── page.tsx               # Control center
│   │       ├── users/page.tsx         # Approve/manage users
│   │       ├── analytics/page.tsx
│   │       └── payments/page.tsx
│   └── api/
│       ├── bookings/
│       │   ├── route.ts               # Create booking
│       │   └── [id]/
│       │       ├── accept/route.ts
│       │       ├── decline/route.ts
│       │       └── complete/route.ts  # Triggers service fee
│       ├── excursions/route.ts
│       ├── availability/route.ts
│       └── stripe/
│           ├── create-invoice/route.ts
│           └── webhook/route.ts
├── components/
│   ├── ui/                            # shadcn components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopNav.tsx
│   ├── excursions/
│   │   ├── ExcursionCard.tsx
│   │   ├── ExcursionForm.tsx
│   │   └── ExcursionCalendar.tsx
│   ├── bookings/
│   │   ├── BookingCard.tsx
│   │   ├── BookingStatusBadge.tsx
│   │   └── BookingRequestModal.tsx
│   └── dashboard/
│       ├── StatsCard.tsx
│       └── RecentActivity.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── stripe.ts
│   ├── resend.ts
│   └── utils.ts
└── types/
    └── database.ts                    # Generated Supabase types
```

---

## Key Business Logic

### Booking Status Flow
```
PENDING → (Partner accepts) → ACCEPTED → (Admin/Partner marks done) → COMPLETED
PENDING → (Partner declines) → REJECTED
```

### Service Fee Trigger (on booking → COMPLETED)
```typescript
// In /api/bookings/[id]/complete/route.ts
const fee = booking.total_persons * 0.50;
await supabase.from('service_fees').insert({
  booking_id: booking.id,
  partner_id: booking.partner_id,
  persons: booking.total_persons,
  amount: fee,
  period: new Date().toISOString().slice(0, 7) // 'YYYY-MM'
});
// Send notification email to partner
```

### Monthly Settlement (Stripe Invoicing)
```typescript
// Run at end of month via cron job or manual trigger
// Group unpaid fees by partner
// Create Stripe Invoice with line items
// Send invoice link to partner via email
```

### Availability Logic
```typescript
// When booking is ACCEPTED, deduct from availability
// Blackout dates: partner manually marks dates as unavailable
// Available slots = max_capacity - accepted_bookings_for_that_date
```

---

## Pages Detail

### Landing Page (/)
- Header: Logo left, "Σύνδεση" button right
- Hero: "Η πλατφόρμα που συνδέει τα τουριστικά γραφεία με τις εμπειρίες της Κρήτης"
- Two CTA cards: "Είμαι Τουριστικό Γραφείο" | "Είμαι Πάροχος Εμπειριών"
- Stats section: X συνεργάτες, Y εκδρομές, Z κρατήσεις
- Categories preview: 7 experience categories with icons
- Footer

### Partner Dashboard Sidebar
- Επισκόπηση
- Εκδρομές
- Κρατήσεις & Πληρωμές
- Γραφεία που Συνεργάζομαι
- Προφίλ Επιχείρησης

### Agency Dashboard Sidebar
- Επισκόπηση
- Αίτημα Εκδρομών (browse + request)
- Κρατήσεις μου
- Συνεργάτες
- Προφίλ Επιχείρησης

### Excursion Creation Form
Fields: name, description (rich text), category (dropdown), area (dropdown),
price_per_person, max_capacity, photos (multi-upload to Supabase Storage),
availability schedule (days of week + hours), duration

---

## Environment Variables (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Setup Commands

```bash
npx create-next-app@latest cretandesk --typescript --tailwind --eslint --app
cd cretandesk
npx shadcn@latest init
npx shadcn@latest add button card input label select textarea badge calendar table dialog sheet
npm install @supabase/supabase-js @supabase/ssr stripe resend lucide-react date-fns
npm install -D @types/node
```

---

## Step-by-Step Build Order

1. **Project setup** + Tailwind config with CretanDesk colors
2. **Supabase setup** — run schema SQL, generate types
3. **Auth middleware** — protected routes per role
4. **Landing page** — design first, responsive
5. **Register flows** — agency + partner forms
6. **Partner dashboard** — layout, sidebar, overview stats
7. **Excursion CRUD** — create, list, edit, photos upload
8. **Availability system** — calendar, slots, blackout
9. **Agency dashboard** — browse excursions, filter, request
10. **Booking system** — full status flow + notifications
11. **Service fee system** — auto-trigger on complete
12. **Stripe invoicing** — monthly settlement
13. **Admin panel** — control center, user approval
14. **Analytics** — charts, KPIs

---

## Notes

- All UI text: Greek language
- Mobile-first design
- RLS (Row Level Security) on all Supabase tables
- Agencies can ONLY see excursions from APPROVED partners
- Partners choose which agencies can book their excursions
- Admin must approve all new registrations before access

---

*CretanDesk v1.0 — Build with Claude Code*
