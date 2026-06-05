"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ExcursionCategory, Area } from "@/types/database";

export async function createExcursion(_prev: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name           = formData.get("name") as string;
  const description    = formData.get("description") as string;
  const categoryRaw    = formData.get("category") as string;
  const category       = (categoryRaw ? categoryRaw.split(":")[0] : "") as ExcursionCategory;
  const area           = formData.get("area") as Area;
  const pricePerPerson = parseFloat(formData.get("price_per_person") as string);
  const maxCapacity    = parseInt(formData.get("max_capacity") as string);
  const durationHours  = parseFloat(formData.get("duration_hours") as string);
  const photos         = (formData.getAll("photo_urls") as string[]).filter(Boolean);
  const scheduleRaw    = formData.get("schedule") as string | null;
  const schedule       = scheduleRaw ? JSON.parse(scheduleRaw) : null;

  if (!name) return { error: "Το όνομα είναι υποχρεωτικό." };

  const { error } = await supabase.from("excursions").insert({
    partner_id:       user.id,
    name,
    description:      description || null,
    category:         category || null,
    area:             area || null,
    price_per_person: isNaN(pricePerPerson) ? null : pricePerPerson,
    max_capacity:     isNaN(maxCapacity) ? null : maxCapacity,
    duration_hours:   isNaN(durationHours) ? null : durationHours,
    photos:           photos && photos.length > 0 ? photos : null,
    schedule:         schedule || null,
    active:           true,
  });

  if (error) return { error: error.message };

  redirect("/partner/excursions");
}

export async function updateExcursion(id: string, formData: FormData) {
  const supabase = await createClient();

  const name           = formData.get("name") as string;
  const description    = formData.get("description") as string;
  const categoryRaw2   = formData.get("category") as string;
  const category       = (categoryRaw2 ? categoryRaw2.split(":")[0] : "") as ExcursionCategory;
  const area           = formData.get("area") as Area;
  const pricePerPerson = parseFloat(formData.get("price_per_person") as string);
  const maxCapacity    = parseInt(formData.get("max_capacity") as string);
  const durationHours  = parseFloat(formData.get("duration_hours") as string);
  const photos         = (formData.getAll("photo_urls") as string[]).filter(Boolean);

  const { error } = await supabase
    .from("excursions")
    .update({
      name,
      description:      description || null,
      category:         category || null,
      area:             area || null,
      price_per_person: isNaN(pricePerPerson) ? null : pricePerPerson,
      max_capacity:     isNaN(maxCapacity) ? null : maxCapacity,
      duration_hours:   isNaN(durationHours) ? null : durationHours,
      photos:           photos && photos.length > 0 ? photos : null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/partner/excursions");
  return { error: null };
}

export async function deleteExcursion(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("excursions")
    .update({ active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/partner/excursions");
}

export async function toggleExcursionActive(id: string, active: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("excursions")
    .update({ active })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/partner/excursions");
}
