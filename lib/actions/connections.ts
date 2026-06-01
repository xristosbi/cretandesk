"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ConnState = { error: string | null };

export async function addConnection(
  _prev: ConnState,
  formData: FormData
): Promise<ConnState> {
  const agencyId = formData.get("agencyId") as string;
  if (!agencyId) return { error: "Λείπει το ID γραφείου." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Μη εξουσιοδοτημένη πρόσβαση." };

  const { error } = await supabase.from("partner_agency_connections").upsert(
    { partner_id: user.id, agency_id: agencyId, status: "approved" },
    { onConflict: "partner_id,agency_id" }
  );

  if (error) return { error: error.message };
  revalidatePath("/partner/agencies");
  return { error: null };
}

export async function removeConnection(
  _prev: ConnState,
  formData: FormData
): Promise<ConnState> {
  const agencyId = formData.get("agencyId") as string;
  if (!agencyId) return { error: "Λείπει το ID γραφείου." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Μη εξουσιοδοτημένη πρόσβαση." };

  const { error } = await supabase
    .from("partner_agency_connections")
    .delete()
    .eq("partner_id", user.id)
    .eq("agency_id", agencyId);

  if (error) return { error: error.message };
  revalidatePath("/partner/agencies");
  return { error: null };
}
