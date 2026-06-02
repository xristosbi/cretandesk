"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe";
import { sendInvoiceEmail } from "@/lib/email";

export type InvoicingState = {
  error: string | null;
  summary: string | null;
};

export async function createMonthlyInvoices(
  _prev: InvoicingState,
  formData: FormData
): Promise<InvoicingState> {
  const period = formData.get("period") as string; // "YYYY-MM"
  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    return { error: "Επιλέξτε έγκυρη περίοδο (ΕΕΕΕ-ΜΜ).", summary: null };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { error: "Το Stripe δεν έχει ρυθμιστεί. Προσθέστε STRIPE_SECRET_KEY στο .env.local.", summary: null };
  }

  const service = createServiceClient();

  // All unpaid fees for the period with partner info
  const { data: fees, error: feesError } = await service
    .from("service_fees")
    .select("id, partner_id, persons, amount")
    .eq("paid", false)
    .eq("period", period)
    .is("stripe_invoice_id", null);

  if (feesError) return { error: feesError.message, summary: null };
  if (!fees?.length) {
    return { error: null, summary: "Δεν υπάρχουν εκκρεμείς χρεώσεις για αυτή την περίοδο." };
  }

  // Group fees by partner_id
  const byPartner = fees.reduce<Record<string, typeof fees>>((acc, fee) => {
    (acc[fee.partner_id] ??= []).push(fee);
    return acc;
  }, {});

  let invoicesCreated = 0;
  const errors: string[] = [];

  for (const [partnerId, partnerFees] of Object.entries(byPartner)) {
    try {
      // Fetch partner name and email
      const [{ data: partner }, { data: profile }] = await Promise.all([
        service.from("partners").select("business_name").eq("id", partnerId).single(),
        service.from("profiles").select("email").eq("id", partnerId).single(),
      ]);

      if (!profile?.email) {
        errors.push(`Παράλειψη ${partnerId}: δεν βρέθηκε email.`);
        continue;
      }

      const totalAmount  = partnerFees.reduce((s, f) => s + (f.amount  ?? 0), 0);
      const totalPersons = partnerFees.reduce((s, f) => s + (f.persons ?? 0), 0);
      const businessName = partner?.business_name ?? profile.email;

      // Find or create Stripe Customer by email
      const existing = await stripe.customers.list({ email: profile.email, limit: 1 });
      const customer = existing.data[0] ?? await stripe.customers.create({
        email: profile.email,
        name:  businessName,
        metadata: { partner_id: partnerId },
      });

      // Create invoice (manual control — we finalize after adding items)
      const invoice = await stripe.invoices.create({
        customer:           customer.id,
        auto_advance:       false,
        collection_method:  "send_invoice",
        days_until_due:     30,
        description:        `CretanDesk — Χρέωση Υπηρεσίας ${period}`,
        metadata:           { partner_id: partnerId, period },
      });

      // Single line item aggregating all fees for this partner/period
      await stripe.invoiceItems.create({
        customer:    customer.id,
        invoice:     invoice.id,
        description: `Χρέωση υπηρεσίας — ${totalPersons} άτομα × 0,50€ (${period})`,
        amount:      Math.round(totalAmount * 100), // cents
        currency:    "eur",
      });

      // Finalize and send via Stripe
      const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
      await stripe.invoices.sendInvoice(finalized.id);

      // Persist invoice ID on all included fees
      await service
        .from("service_fees")
        .update({ stripe_invoice_id: finalized.id })
        .in("id", partnerFees.map((f) => f.id));

      // Send our own branded email with the invoice link
      await sendInvoiceEmail({
        partnerEmail: profile.email,
        partnerName:  businessName,
        period,
        amount:       totalAmount,
        invoiceUrl:   finalized.hosted_invoice_url ?? "",
      });

      invoicesCreated++;
    } catch (err) {
      errors.push(`${partnerId}: ${err instanceof Error ? err.message : "Άγνωστο σφάλμα"}`);
    }
  }

  revalidatePath("/admin/payments");

  const summary = [
    `${invoicesCreated} τιμολόγια δημιουργήθηκαν για την περίοδο ${period}.`,
    errors.length ? `Σφάλματα (${errors.length}): ${errors.join(" | ")}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return { error: null, summary };
}
