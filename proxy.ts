import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PARTNER = /^\/partner(\/|$)/;
const PROTECTED_AGENCY  = /^\/agency(\/|$)/;
const PROTECTED_ADMIN   = /^\/admin(\/|$)/;
const AUTH_PAGES        = /^\/(login|register)(\/|$)/;

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Pass through if Supabase is not yet configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isDashboard =
    PROTECTED_PARTNER.test(pathname) ||
    PROTECTED_AGENCY.test(pathname)  ||
    PROTECTED_ADMIN.test(pathname);

  // Unauthenticated → redirect to login for protected routes
  if (isDashboard && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated → guard role-specific dashboards
  if (isDashboard && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

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

    // Wrong dashboard for role → redirect to correct one
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

  // Logged-in approved users visiting login/register → redirect to their dashboard
  if (AUTH_PAGES.test(pathname) && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (profile?.status === "approved") {
      const url = request.nextUrl.clone();
      url.pathname =
        profile.role === "admin"   ? "/admin"   :
        profile.role === "partner" ? "/partner" : "/agency";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
