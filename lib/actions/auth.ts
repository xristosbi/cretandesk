"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole, UserStatus, Area } from "@/types/database";

type AuthState = { error: string | null };

type ProfileResult = { role: UserRole | null; status: UserStatus } | null;

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Συμπλήρωσε email και κωδικό." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "Λάθος email ή κωδικός πρόσβασης." };
    }
    return { error: error.message };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Αποτυχία σύνδεσης." };

  const { data } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  const profile = data as ProfileResult;

  if (!profile?.role) {
    return { error: "Ο λογαριασμός σου δεν έχει ρόλο. Επικοινώνησε με την υποστήριξη." };
  }

  if (profile.status === "pending")   redirect("/pending");
  if (profile.status === "suspended") redirect("/suspended");

  if (profile.role === "admin")   redirect("/admin");
  if (profile.role === "partner") redirect("/partner");
  if (profile.role === "agency")  redirect("/agency");

  redirect("/");
}

export async function registerAgency(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email         = formData.get("email") as string;
  const password      = formData.get("password") as string;
  const businessName  = formData.get("business_name") as string;
  const afm           = formData.get("afm") as string;
  const gemi          = formData.get("gemi") as string;
  const eot           = formData.get("eot") as string;
  const phone         = formData.get("phone") as string;
  const address       = formData.get("address") as string;

  if (!email || !password || !businessName) {
    return { error: "Συμπλήρωσε όλα τα υποχρεωτικά πεδία." };
  }
  if (password.length < 8) {
    return { error: "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες." };
  }

  const supabase = await createClient();

  const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      return { error: "Αυτό το email χρησιμοποιείται ήδη." };
    }
    return { error: signUpError.message };
  }

  const userId = data.user?.id;
  if (!userId) return { error: "Αποτυχία δημιουργίας λογαριασμού." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (supabase.from("profiles") as any)
    .update({ role: "agency" as UserRole, status: "pending" as UserStatus })
    .eq("id", userId);

  if (profileError) return { error: profileError.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: agencyError } = await (supabase.from("agencies") as any)
    .insert({
      id:            userId,
      business_name: businessName,
      afm:           afm     || null,
      gemi:          gemi    || null,
      eot:           eot     || null,
      phone:         phone   || null,
      address:       address || null,
      approved:      false,
    });

  if (agencyError) return { error: agencyError.message };

  redirect("/pending");
}

export async function registerPartner(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email        = formData.get("email") as string;
  const password     = formData.get("password") as string;
  const businessName = formData.get("business_name") as string;
  const afm          = formData.get("afm") as string;
  const phone        = formData.get("phone") as string;
  const description  = formData.get("description") as string;
  const areasRaw     = formData.getAll("areas") as Area[];

  if (!email || !password || !businessName) {
    return { error: "Συμπλήρωσε όλα τα υποχρεωτικά πεδία." };
  }
  if (password.length < 8) {
    return { error: "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες." };
  }

  const supabase = await createClient();

  const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      return { error: "Αυτό το email χρησιμοποιείται ήδη." };
    }
    return { error: signUpError.message };
  }

  const userId = data.user?.id;
  if (!userId) return { error: "Αποτυχία δημιουργίας λογαριασμού." };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (supabase.from("profiles") as any)
    .update({ role: "partner" as UserRole, status: "pending" as UserStatus })
    .eq("id", userId);

  if (profileError) return { error: profileError.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: partnerError } = await (supabase.from("partners") as any)
    .insert({
      id:            userId,
      business_name: businessName,
      afm:           afm         || null,
      phone:         phone       || null,
      description:   description || null,
      areas:         areasRaw.length > 0 ? areasRaw : null,
      approved:      false,
    });

  if (partnerError) return { error: partnerError.message };

  redirect("/pending");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
