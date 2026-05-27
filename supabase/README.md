# CretanDesk — Supabase Setup Guide

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New project → choose a region close to Greece (Frankfurt or Stockholm).

## 2. Get your credentials

Dashboard → Settings → API:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (e.g. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key — **never expose client-side** |

Paste all three into `.env.local`.

## 3. Run the schema

Dashboard → SQL Editor → New query → paste and run each file in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_storage_buckets.sql`

## 4. Configure Auth

Dashboard → Authentication → Providers:
- **Email** — enable, disable "Confirm email" for development (re-enable for production)

Dashboard → Authentication → URL Configuration:
- Site URL: `http://localhost:3000` (dev) / `https://yourdomain.com` (prod)
- Redirect URLs: add `http://localhost:3000/**`

## 5. Make the first Admin

After you sign up with the admin email, run in SQL Editor:

```sql
UPDATE profiles
SET role = 'admin', status = 'approved'
WHERE email = 'your-admin@email.com';
```

## 6. Tables created

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` — role + approval status |
| `partners` | Experience provider business details |
| `agencies` | Travel agency business details |
| `partner_agency_connections` | Which agencies a partner works with |
| `excursions` | Excursion listings |
| `availability` | Per-day slots + blackout dates |
| `bookings` | Agency booking requests |
| `service_fees` | 0.50€/person fee on completed bookings |

## 7. RLS summary

| Table | Agency can… | Partner can… | Admin can… |
|---|---|---|---|
| `profiles` | Read/update own | Read/update own | Read/update all |
| `partners` | Read approved+connected | Read/update own | All |
| `agencies` | Read/update own | Read connected | All |
| `excursions` | Read active from connected | Full CRUD own | All |
| `availability` | Read from connected | Full CRUD own | All |
| `bookings` | Create + read own | Read + update status | All |
| `service_fees` | — | Read own | All |
