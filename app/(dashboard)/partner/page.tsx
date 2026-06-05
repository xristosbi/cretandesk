import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PartnerCalendar } from "./PartnerCalendar";
import { PartnerBookingActions } from "./PartnerBookingActions";
import { BlackoutPanel } from "./BlackoutPanel";

// ── Types ────────────────────────────────────────────────────────

type BookingRow = {
  id: string;
  date: string;
  total_persons: number;
  status: string;
  notes: string | null;
  excursions: { id: string; name: string } | null;
  agencies: { id: string; business_name: string } | null;
};

type ExcursionRow = {
  id: string;
  name: string;
  price_per_person: number | null;
  max_capacity: number | null;
};

type AvailRow = {
  excursion_id: string;
  date: string;
  available_slots: number;
  excursions: { name: string } | null;
};

// ── Inline badge ──────────────────────────────────────────────────

function Badge({ children, bg, fg }: { children: React.ReactNode; bg: string; fg: string }) {
  return (
    <span style={{ padding: "4px 10px", borderRadius: "6px", background: bg, color: fg, fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default async function PartnerOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const twoMonthsOut = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // ── Round 1: parallel ────────────────────────────────────────────
  const [
    { data: rawPartner },
    { data: rawExcursions },
    { data: rawBookings },
  ] = await Promise.all([
    supabase.from("partners").select("business_name").eq("id", user.id).single(),
    supabase.from("excursions")
      .select("id, name, price_per_person, max_capacity")
      .eq("partner_id", user.id)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("bookings")
      .select("id, date, total_persons, status, notes, excursions(id, name), agencies(id, business_name)")
      .eq("partner_id", user.id)
      .in("status", ["pending", "accepted"])
      .order("date", { ascending: true })
      .limit(40),
  ]);

  const partner = rawPartner as { business_name: string } | null;
  const excursions = (rawExcursions ?? []) as ExcursionRow[];
  const bookings = (rawBookings ?? []) as BookingRow[];

  // Booked dates for calendar (all active bookings)
  const bookedDates = bookings.map(b => b.date);

  // Group bookings by agency for right panel
  const byAgency: Record<string, { name: string; bookings: BookingRow[] }> = {};
  for (const b of bookings) {
    const ag = b.agencies as { id: string; business_name: string } | null;
    const key = ag?.id ?? "—";
    if (!byAgency[key]) byAgency[key] = { name: ag?.business_name ?? "—", bookings: [] };
    byAgency[key].bookings.push(b);
  }

  // ── Round 2: availability + blackouts ────────────────────────────
  let nearestByExcursion = new Map<string, { date: string; slots: number }>();
  let upcomingAvail: AvailRow[] = [];
  let blackoutDates: string[] = [];
  let allBlackouts: { excursion_id: string; date: string }[] = [];

  if (excursions.length > 0) {
    const ids = excursions.map(e => e.id);
    const [{ data: availData }, { data: blackoutData }] = await Promise.all([
      supabase
        .from("availability")
        .select("excursion_id, date, available_slots, excursions(name)")
        .in("excursion_id", ids)
        .gte("date", today)
        .lte("date", twoMonthsOut)
        .eq("blackout", false)
        .gt("available_slots", 0)
        .order("date")
        .limit(30),
      supabase
        .from("availability")
        .select("excursion_id, date")
        .in("excursion_id", ids)
        .eq("blackout", true)
        .gte("date", today)
        .order("date")
        .limit(200),
    ]);

    const avail = (availData ?? []) as AvailRow[];
    allBlackouts = (blackoutData ?? []) as { excursion_id: string; date: string }[];
    blackoutDates = [...new Set(allBlackouts.map(b => b.date))];

    // Nearest upcoming slot per excursion (for left panel)
    for (const a of avail) {
      if (!nearestByExcursion.has(a.excursion_id)) {
        nearestByExcursion.set(a.excursion_id, { date: a.date, slots: a.available_slots });
      }
    }

    upcomingAvail = avail.slice(0, 10);
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="p-6" style={{ background: "#F4F6F9", minHeight: "100%" }}>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">
          Καλημέρα{partner?.business_name ? `, ${partner.business_name}` : ""}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6B7A8D" }}>Επισκόπηση κρατήσεών σου</p>
      </div>

      {/* Two-column layout — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">

        {/* ═══ LEFT: Οι Εκδρομές Μου ═══ */}
        <div className="flex flex-col gap-5">

          {/* Calendar card */}
          <div
            className="bg-white rounded-2xl p-5"
            style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            <h2 className="font-semibold text-base mb-4" style={{ color: "#1B3A5C" }}>
              Οι Εκδρομές Μου
            </h2>
            <PartnerCalendar bookedDates={bookedDates} blackoutDates={blackoutDates} />
          </div>

          {/* Active excursions list */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid #F0F2F5" }}
            >
              <h2 className="font-semibold text-base" style={{ color: "#1B3A5C" }}>
                Ενεργές Εκδρομές
              </h2>
              <Link href="/partner/excursions">
                <span style={{ fontSize: "12px", color: "#2563EB", fontWeight: 500 }}>Όλες →</span>
              </Link>
            </div>

            {!excursions.length ? (
              <div className="py-10 text-center text-sm" style={{ color: "#9CA3AF" }}>
                Δεν υπάρχουν ενεργές εκδρομές.{" "}
                <Link href="/partner/excursions/new">
                  <span style={{ color: "#2563EB" }}>Προσθέστε μία →</span>
                </Link>
              </div>
            ) : (
              <div>
                {excursions.map((e, idx) => {
                  const next = nearestByExcursion.get(e.id);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-3 px-5 py-3.5"
                      style={{ borderBottom: idx < excursions.length - 1 ? "1px solid #F0F2F5" : "none" }}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "#1B3A5C" }}>{e.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                          {e.price_per_person != null ? `${formatCurrency(e.price_per_person)}/άτομο` : ""}
                          {e.price_per_person != null && next ? " · " : ""}
                          {next ? `${formatDate(next.date)}` : "Χωρίς διαθεσιμότητα"}
                        </p>
                      </div>

                      {next ? (
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          background: next.slots >= 10 ? "#D1FAE5" : next.slots >= 4 ? "#FEF3C7" : "#FEE2E2",
                          color: next.slots >= 10 ? "#065F46" : next.slots >= 4 ? "#92400E" : "#991B1B",
                          fontSize: "12px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}>
                          {next.slots} {next.slots === 1 ? "θέση" : "θέσεις"}
                        </span>
                      ) : (
                        <span style={{ padding: "4px 10px", borderRadius: "6px", background: "#F3F4F6", color: "#9CA3AF", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap" }}>
                          —
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Blackout management */}
          <BlackoutPanel excursions={excursions} blackouts={allBlackouts} />
        </div>

        {/* ═══ RIGHT: Κρατήσεις + Διαθεσιμότητα ═══ */}
        <div className="flex flex-col gap-5">

          {/* Bookings grouped by agency */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid #F0F2F5" }}
            >
              <h2 className="font-semibold text-base" style={{ color: "#1B3A5C" }}>Οι Κρατήσεις Μου</h2>
              <Link href="/partner/bookings">
                <span style={{ fontSize: "12px", color: "#2563EB", fontWeight: 500 }}>Όλες →</span>
              </Link>
            </div>

            {!Object.keys(byAgency).length ? (
              <div className="py-10 text-center text-sm" style={{ color: "#9CA3AF" }}>
                Δεν υπάρχουν ενεργές κρατήσεις.
              </div>
            ) : (
              <div>
                {Object.entries(byAgency).map(([key, { name, bookings: agBookings }], gi) => (
                  <div
                    key={key}
                    style={{ borderBottom: gi < Object.keys(byAgency).length - 1 ? "1px solid #F0F2F5" : "none" }}
                  >
                    {/* Agency group header */}
                    <div className="px-5 pt-4 pb-2">
                      <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3AF" }}>
                        {name}
                      </span>
                    </div>

                    {/* Booking rows */}
                    <div className="px-5 pb-4 flex flex-col gap-2">
                      {agBookings.map(b => {
                        const excursion = b.excursions as { id: string; name: string } | null;
                        return (
                          <div
                            key={b.id}
                            className="rounded-xl px-4 py-3"
                            style={{ background: "#F8FAFC" }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: "#1B3A5C" }}>
                                  {excursion?.name ?? "—"}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                                  {formatDate(b.date)} · {b.total_persons} {b.total_persons === 1 ? "άτομο" : "άτομα"}
                                </p>
                                {b.notes && (
                                  <p className="text-xs mt-1 italic" style={{ color: "#6B7A8D" }}>
                                    &ldquo;{b.notes}&rdquo;
                                  </p>
                                )}
                              </div>

                              {/* Status badge for accepted, or nothing (actions below handle pending) */}
                              {b.status === "accepted" && (
                                <Badge bg="#D1FAE5" fg="#065F46">Εγκρίθηκε</Badge>
                              )}
                            </div>

                            {/* Action buttons row */}
                            <div className="mt-2.5 flex items-center justify-between gap-2">
                              <PartnerBookingActions bookingId={b.id} status={b.status} />
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
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #F0F2F5" }}>
              <h2 className="font-semibold text-base" style={{ color: "#1B3A5C" }}>Διαθεσιμότητα</h2>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                Επόμενες διαθέσιμες ημερομηνίες εκδρομών σου
              </p>
            </div>

            {!upcomingAvail.length ? (
              <div className="py-8 text-center text-sm" style={{ color: "#9CA3AF" }}>
                Δεν έχει οριστεί διαθεσιμότητα για τις εκδρομές σου.
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
