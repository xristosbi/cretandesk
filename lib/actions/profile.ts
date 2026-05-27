"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Area } from "@/types/database";

type ActionState = { error: string | null }

export async function updatePartnerProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const businessName = formData.get("business_name") as string;
  const afm          = formData.get("afm") as string;
  const phone        = formData.get("phone") as string;
  const description  = formData.get("description") as string;
  const areasRaw     = formData.getAll("areas") as Area[];

  const { error } = await supabase
    .from("partners")
    .update({
      business_name: businessName,
      afm:           afm         || null,
      phone:         phone       || null,
      description:   description || null,
      areas:         areasRaw.length > 0 ? areasRaw : null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/partner/profile");
  return { error: null };
}

export async function updateAgencyProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const businessName = formData.get("business_name") as string;
  const afm          = formData.get("afm") as string;
  const gemi         = formData.get("gemi") as string;
  const eot          = formData.get("eot") as string;
  const phone        = formData.get("phone") as string;
  const address      = formData.get("address") as string;

  const { error } = await supabase
    .from("agencies")
    .update({
      business_name: businessName,
      afm:           afm     || null,
      gemi:          gemi    || null,
      eot:           eot     || null,
      phone:         phone   || null,
      address:       address || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/agency/profile");
  return { error: null };
}
