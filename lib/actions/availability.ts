"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setBlackout(excursionId: string, date: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: ex } = await supabase
    .from("excursions")
    .select("id")
    .eq("id", excursionId)
    .eq("partner_id", user.id)
    .single();
  if (!ex) throw new Error("Excursion not found");

  const { error } = await supabase.from("availability").upsert(
    { excursion_id: excursionId, date, blackout: true, available_slots: 0 },
    { onConflict: "excursion_id,date" }
  );
  if (error) throw new Error(error.message);

  revalidatePath("/partner");
  revalidatePath("/partner/bookings");
}

export async function removeBlackout(excursionId: string, date: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: ex } = await supabase
    .from("excursions")
    .select("id")
    .eq("id", excursionId)
    .eq("partner_id", user.id)
    .single();
  if (!ex) throw new Error("Excursion not found");

  const { error } = await supabase
    .from("availability")
    .delete()
    .eq("excursion_id", excursionId)
    .eq("date", date);
  if (error) throw new Error(error.message);

  revalidatePath("/partner");
  revalidatePath("/partner/bookings");
}
