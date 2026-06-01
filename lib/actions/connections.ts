"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addConnection(agencyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // upsert so duplicate clicks don't throw on the UNIQUE constraint
  await supabase.from("partner_agency_connections").upsert(
    { partner_id: user.id, agency_id: agencyId, status: "approved" },
    { onConflict: "partner_id,agency_id" }
  );

  revalidatePath("/partner/agencies");
}

export async function removeConnection(agencyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("partner_agency_connections")
    .delete()
    .eq("partner_id", user.id)
    .eq("agency_id", agencyId);

  revalidatePath("/partner/agencies");
}
