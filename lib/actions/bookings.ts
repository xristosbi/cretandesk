"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  sendNewBookingRequestEmail,
  sendBookingAcceptedEmail,
  sendBookingDeclinedEmail,
} from "@/lib/email";

type BookingActionState = { error: string | null };

export async function acceptBooking(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const bookingId = formData.get("bookingId") as string;
  if (!bookingId) return { error: "Λείπει το ID κράτησης." };

  const supabase = await createClient();

  // Fetch booking details needed for the email before updating status
  const { data: booking } = await supabase
    .from("bookings")
    .select("agency_id, partner_id, date, total_persons, excursions(name), partners(business_name)")
    .eq("id", bookingId)
    .single();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  revalidatePath("/partner/bookings");

  // Email — fetch agency email and notify them
  if (booking) {
    const service = createServiceClient();
    const { data: agencyProfile } = await service
      .from("profiles")
      .select("email")
      .eq("id", booking.agency_id)
      .single();

    const partner = booking.partners as { business_name: string } | null;
    const excursion = booking.excursions as { name: string } | null;

    if (agencyProfile?.email) {
      await sendBookingAcceptedEmail({
        agencyEmail:  agencyProfile.email,
        partnerName:  partner?.business_name ?? "",
        excursionName: excursion?.name ?? "",
        date:         booking.date,
        persons:      booking.total_persons,
      });
    }
  }

  return { error: null };
}

export async function declineBooking(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const bookingId = formData.get("bookingId") as string;
  if (!bookingId) return { error: "Λείπει το ID κράτησης." };

  const supabase = await createClient();

  // Fetch booking details for email before updating
  const { data: booking } = await supabase
    .from("bookings")
    .select("agency_id, partner_id, date, excursions(name), partners(business_name)")
    .eq("id", bookingId)
    .single();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  revalidatePath("/partner/bookings");

  // Email — notify agency of rejection
  if (booking) {
    const service = createServiceClient();
    const { data: agencyProfile } = await service
      .from("profiles")
      .select("email")
      .eq("id", booking.agency_id)
      .single();

    const partner = booking.partners as { business_name: string } | null;
    const excursion = booking.excursions as { name: string } | null;

    if (agencyProfile?.email) {
      await sendBookingDeclinedEmail({
        agencyEmail:   agencyProfile.email,
        partnerName:   partner?.business_name ?? "",
        excursionName: excursion?.name ?? "",
        date:          booking.date,
      });
    }
  }

  return { error: null };
}

export async function completeBooking(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const bookingId = formData.get("bookingId") as string;
  if (!bookingId) return { error: "Λείπει το ID κράτησης." };

  const supabase = await createClient();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, total_persons, partner_id, status")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) return { error: "Η κράτηση δεν βρέθηκε." };

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (updateError) return { error: updateError.message };

  const serviceClient = createServiceClient();
  const period = new Date().toISOString().slice(0, 7);
  const amount = booking.total_persons * 0.5;

  const { error: feeError } = await serviceClient.from("service_fees").insert({
    booking_id: bookingId,
    partner_id: booking.partner_id,
    persons:    booking.total_persons,
    amount,
    period,
    paid:       false,
  });

  if (feeError) return { error: feeError.message };

  revalidatePath("/partner/bookings");
  revalidatePath("/partner/payments");
  return { error: null };
}

export async function createBooking(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agency } = await supabase
    .from("agencies")
    .select("id, business_name")
    .eq("id", user.id)
    .single();

  if (!agency) return { error: "Δεν βρέθηκε το τουριστικό γραφείο." };

  const excursionId     = formData.get("excursion_id") as string;
  const partnerId       = formData.get("partner_id") as string;
  const date            = formData.get("date") as string;
  const personsAdults   = parseInt(formData.get("persons_adults") as string) || 0;
  const personsChildren = parseInt(formData.get("persons_children") as string) || 0;
  const notes           = formData.get("notes") as string;

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

  // Email — notify partner of new booking request
  const service = createServiceClient();
  const [{ data: partnerProfile }, { data: excursion }] = await Promise.all([
    service.from("profiles").select("email").eq("id", partnerId).single(),
    service.from("excursions").select("name").eq("id", excursionId).single(),
  ]);

  if (partnerProfile?.email) {
    await sendNewBookingRequestEmail({
      partnerEmail:  partnerProfile.email,
      agencyName:    (agency as { id: string; business_name: string }).business_name,
      excursionName: excursion?.name ?? "",
      date,
      persons:       personsAdults + personsChildren,
      notes:         notes || null,
    });
  }

  return { error: null };
}
