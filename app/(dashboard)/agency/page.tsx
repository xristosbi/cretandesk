import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AgencyCalendar } from "./AgencyCalendar";
import { CancelBookingButton } from "./CancelBookingButton";

type BookingRow = {
  id: string;
  date: string;
  total_persons: number;
  status: string;
  excursions: { name: string } | null;
  partners: { id: string; business_name: string } | null;
};

type ExcursionRow = {
  id: string;
  name: string;
  price_per_person: number | null;
  max_capacity: number | null;
  partner_id: string;
  partners: { business_name: string } | null;
};

type AvailRow = {
  excursion_id: string;
  date: string;
  available_slots: number;
  excursions: { name: string } | null;
};

// ── Inline badge helpers ──────────────────────────────────────────

function Badge({ children, bg, fg }: { children: React.ReactNode; bg: string; fg: string }) {
  return (
    <span style={{ padding: "4px 10px", borderRadius: "6px", background: bg, color: fg, fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────

export default async function AgencyOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const twoMonthsOut = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // ── Round 1: parallel independent fetches ───────────────────────
  const [
    { data: rawAgency },
    { data: connections },
    { data: rawBookings },
  ] = await Promise.all([
    supabase.from("agencies").select("business_name").eq("id", user.id).single(),
    supabase.from("partner_agency_connections")
      .select("partner_id")
      .eq("agency_id", user.id)
      .eq("status", "approved"),
    supabase.from("bookings")
      .select("id, date, total_persons, status, excursions(name), partners(id, business_name)")
      .eq("agency_id", user.id)
      .in("status", ["pending", "accepted", "rejected"])
      .order("date", { ascending: true })
      .limit(30),
  ]);

  const agency = rawAgency as { business_name: string } | null;
  const partnerIds = connections?.map((c: { partner_id: string }) => c.partner_id) ?? [];
  const bookings = (rawBookings ?? []) as BookingRow[];

  // Calendar highlighted dates (non-rejected bookings)
  const bookedDates = bookings.filter(b => b.status !== "rejected").map(b => b.date);

  // Group bookings by partner for right-side display
  const byPartner: Record<string, { name: string; bookings: BookingRow[] }> = {};
  for (const b of bookings) {
    const p = b.partners as { id: string; business_name: string } | null;
    const key = p?.id ?? "—";
    if (!byPartner[key]) byPartner[key] = { name: p?.business_name ?? "—", bookings: [] };
    byPartner[key].bookings.push(b);
  }

  // ── Round 2: excursions from connected partners ─────────────────
  let excursions: ExcursionRow[] = [];
  if (partnerIds.length > 0) {
    const { data } = await supabase
      .from("excursions")
      .select("id, name, price_per_person, max_capacity, partner_id, partners(business_name)")
      .in("partner_id", partnerIds)
      .eq("active", true)
      .limit(8);
    excursions = (data ?? []) as ExcursionRow[];
  }

  // ── Round 3: availability ───────────────────────────────────────
  let upcomingAvail: AvailRow[] = [];
  let closedToday = new Set<string>();

  if (excursions.length > 0) {
    const ids = excursions.map(e => e.id);
    const [{ data: upcoming }, { data: todaySlots }] = await Promise.all([
      supabase.from("availability")
        .select("excursion_id, date, available_slots, excursions(name)")
        .in("excursion_id", ids)
        .gte("date", today)
        .lte("date", twoMonthsOut)
        .eq("blackout", false)
        .gt("available_slots", 0)
        .order("date")
        .limit(8),
      supabase.from("availability")
        .select("excursion_id, available_slots, blackout")
        .in("excursion_id", ids)
        .eq("date", today),
    ]);
    upcomingAvail = (upcoming ?? []) as AvailRow[];
    closedToday = new Set(
      ((todaySlots ?? []) as { excursion_id: string; available_slots: number; blackout: boolean }[])
        .filter(a => a.available_slots === 0 || a.blackout)
        .map(a => a.excursion_id)
    );
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="p-6" style={{ background: "#F4F6F9", minHeight: "100%" }}>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">
          Καλημέρα{agency?.business_name ? `, ${agency.business_name}` : ""}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6B7A8D" }}>Επισκόπηση κρατήσεών σου</p>
      </div>

      {/* Two-column layout — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">

        {/* ═══ LEFT COLUMN ═══ */}
        <div className="flex flex-col gap-5">

          {/* Calendar card */}
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h2 className="font-semibold text-base mb-4" style={{ color: "#1B3A5C" }}>Το Γραφείο Μου</h2>
            <AgencyCalendar bookedDates={bookedDates} />
          </div>

          {/* Available excursions list */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #F0F2F5" }}>
              <h2 className="font-semibold text-base" style={{ color: "#1B3A5C" }}>Διαθέσιμες Εκδρομές</h2>
              <Link href="/agency/excursions">
                <span style={{ fontSize: "12px", color: "#2563EB", fontWeight: 500 }}>Όλες →</span>
              </Link>
            </div>

            {!excursions.length ? (
              <div className="py-10 text-center text-sm" style={{ color: "#9CA3AF" }}>
                Συνδεθείτε με παρόχους για να δείτε εκδρομές.
              </div>
            ) : (
              <div>
                {excursions.map((e, idx) => {
                  const partner = e.partners as { business_name: string } | null;
                  const isClosed = closedToday.has(e.id);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-3 px-5 py-3.5"
                      style={{ borderBottom: idx < excursions.length - 1 ? "1px solid #F0F2F5" : "none" }}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "#1B3A5C" }}>{e.name}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: "#9CA3AF" }}>
                          {partner?.business_name ?? "—"}
                          {e.price_per_person != null ? ` · ${formatCurrency(e.price_per_person)}/άτομο` : ""}
                        </p>
                      </div>

                      {isClosed ? (
                        <span style={{ padding: "5px 12px", borderRadius: "6px", background: "#F3F4F6", color: "#9CA3AF", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap" }}>
                          Κλειστό
                        </span>
                      ) : (
                        <Link href="/agency/excursions">
                          <span style={{ display: "inline-block", padding: "5px 12px", borderRadius: "6px", background: "#2563EB", color: "white", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap", textDecoration: "none" }}>
                            Αίτημα
                          </span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="flex flex-col gap-5">

          {/* Bookings grouped by partner */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #F0F2F5" }}>
              <h2 className="font-semibold text-base" style={{ color: "#1B3A5C" }}>Οι Κρατήσεις Μου</h2>
              <Link href="/agency/bookings">
                <span style={{ fontSize: "12px", color: "#2563EB", fontWeight: 500 }}>Όλες →</span>
              </Link>
            </div>

            {!Object.keys(byPartner).length ? (
              <div className="py-10 text-center text-sm" style={{ color: "#9CA3AF" }}>
                Δεν υπάρχουν κρατήσεις ακόμα.
              </div>
            ) : (
              <div>
                {Object.entries(byPartner).map(([key, { name, bookings: pBookings }], gi) => (
                  <div
                    key={key}
                    style={{ borderBottom: gi < Object.keys(byPartner).length - 1 ? "1px solid #F0F2F5" : "none" }}
                  >
                    {/* Partner group header */}
                    <div className="px-5 pt-4 pb-2">
                      <span
                        style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3AF" }}
                      >
                        {name}
                      </span>
                    </div>

                    {/* Booking rows */}
                    <div className="px-5 pb-4 flex flex-col gap-2">
                      {pBookings.map(b => {
                        const excursion = b.excursions as { name: string } | null;
                        return (
                          <div
                            key={b.id}
                            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                            style={{ background: "#F8FAFC" }}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: "#1B3A5C" }}>
                                {excursion?.name ?? "—"}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                                {formatDate(b.date)} · {b.total_persons} άτομα
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {b.status === "pending" && (
                                <>
                                  <Badge bg="#FEF3C7" fg="#92400E">Αναμονή</Badge>
                                  <CancelBookingButton bookingId={b.id} />
                                </>
                              )}
                              {b.status === "accepted" && (
                                <Badge bg="#D1FAE5" fg="#065F46">Εγκρίθηκε</Badge>
                              )}
                              {b.status === "rejected" && (
                                <Badge bg="#FEE2E2" fg="#991B1B">Απορρίφθηκε</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Availability section */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #F0F2F5" }}>
              <h2 className="font-semibold text-base" style={{ color: "#1B3A5C" }}>Διαθεσιμότητα</h2>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Επόμενες διαθέσιμες ημερομηνίες εκδρομών</p>
            </div>

            {!upcomingAvail.length ? (
              <div className="py-8 text-center text-sm" style={{ color: "#9CA3AF" }}>
                Δεν υπάρχουν δεδομένα διαθεσιμότητας.
              </div>
            ) : (
              <div>
                {upcomingAvail.map((a, idx) => {
                  const excursion = a.excursions as { name: string } | null;
                  const slots = a.available_slots;
                  return (
                    <div
                      key={`${a.excursion_id}-${a.date}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5"
                      style={{ borderBottom: idx < upcomingAvail.length - 1 ? "1px solid #F0F2F5" : "none" }}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "#1B3A5C" }}>
                          {excursion?.name ?? "—"}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{formatDate(a.date)}</p>
                      </div>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        background: slots >= 10 ? "#D1FAE5" : slots >= 4 ? "#FEF3C7" : "#FEE2E2",
                        color: slots >= 10 ? "#065F46" : slots >= 4 ? "#92400E" : "#991B1B",
                        fontSize: "12px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}>
                        {slots} {slots === 1 ? "θέση" : "θέσεις"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
