import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PROTECTED_PARTNER = /^\/partner(\/|$)/;
const PROTECTED_AGENCY  = /^\/agency(\/|$)/;
const PROTECTED_ADMIN   = /^\/admin(\/|$)/;
const AUTH_PAGES        = /^\/(login|register)(\/|$)/;

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Pass through if Supabase is not yet configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Always call getUser — this refreshes the session token and writes new cookies
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isDashboard =
    PROTECTED_PARTNER.test(pathname) ||
    PROTECTED_AGENCY.test(pathname)  ||
    PROTECTED_ADMIN.test(pathname);

  // ── Unauthenticated → send to login ────────────────────────────────────────
  if (isDashboard && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ── Authenticated on a dashboard route ─────────────────────────────────────
  if (isDashboard && user) {
    let profile: { role: string | null; status: string } | null = null;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();
      profile = data as { role: string | null; status: string } | null;
    } catch {
      // DB not reachable / schema not set up — let the page handle it
      return response;
    }

    // Profile missing → send to login (account not fully set up)
    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (profile.status === "pending") {
      const url = request.nextUrl.clone();
      url.pathname = "/pending";
      return NextResponse.redirect(url);
    }

    if (profile.status === "suspended") {
      const url = request.nextUrl.clone();
      url.pathname = "/suspended";
      return NextResponse.redirect(url);
    }

    // Wrong dashboard for this role
    const wrongDashboard =
      (PROTECTED_PARTNER.test(pathname) && profile.role !== "partner") ||
      (PROTECTED_AGENCY.test(pathname)  && profile.role !== "agency")  ||
      (PROTECTED_ADMIN.test(pathname)   && profile.role !== "admin");

    if (wrongDashboard) {
      const url = request.nextUrl.clone();
      url.pathname =
        profile.role === "admin"   ? "/admin"   :
        profile.role === "partner" ? "/partner" : "/agency";
      return NextResponse.redirect(url);
    }
  }

  // ── Logged-in & approved visiting auth pages → go to dashboard ─────────────
  if (AUTH_PAGES.test(pathname) && user) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();
      const profile = data as { role: string | null; status: string } | null;

      if (profile?.status === "approved") {
        const url = request.nextUrl.clone();
        url.pathname =
          profile.role === "admin"   ? "/admin"   :
          profile.role === "partner" ? "/partner" : "/agency";
        return NextResponse.redirect(url);
      }
    } catch {
      // pass through
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
