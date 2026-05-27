"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function acceptBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (error) throw new Error(error.message);

  revalidatePath("/partner/bookings");
}

export async function declineBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (error) throw new Error(error.message);

  revalidatePath("/partner/bookings");
}

export async function completeBooking(bookingId: string) {
  const supabase = await createClient();

  // Fetch the booking to get total_persons and partner_id
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, total_persons, partner_id, status")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) throw new Error("Booking not found");

  // Update booking status
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (updateError) throw new Error(updateError.message);

  // Insert service fee using service client (bypasses RLS)
  const serviceClient = createServiceClient();
  const period = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const amount = booking.total_persons * 0.5;

  const { error: feeError } = await serviceClient.from("service_fees").insert({
    booking_id: bookingId,
    partner_id: booking.partner_id,
    persons:    booking.total_persons,
    amount,
    period,
    paid:       false,
  });

  if (feeError) throw new Error(feeError.message);

  revalidatePath("/partner/bookings");
  revalidatePath("/partner/payments");
}

export async function createBooking(_prev: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get agency id
  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!agency) return { error: "Δεν βρέθηκε το τουριστικό γραφείο." };

  const excursionId   = formData.get("excursion_id") as string;
  const partnerId     = formData.get("partner_id") as string;
  const date          = formData.get("date") as string;
  const personsAdults = parseInt(formData.get("persons_adults") as string) || 0;
  const personsChildren = parseInt(formData.get("persons_children") as string) || 0;
  const notes         = formData.get("notes") as string;

  if (!excursionId || !partnerId || !date) {
    return { error: "Συμπλήρωσε όλα τα υποχρεωτικά πεδία." };
  }

  const { error } = await supabase.from("bookings").insert({
    agency_id:        user.id,
    excursion_id:     excursionId,
    partner_id:       partnerId,
    date,
    persons_adults:   personsAdults,
    persons_children: personsChildren,
    notes:            notes || null,
    status:           "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/agency/bookings");
  revalidatePath("/agency/excursions");

  return { error: null };
}
