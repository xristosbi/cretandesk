import { createClient } from "@/lib/supabase/server";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import { BookingActions } from "./BookingActions";
import { BlackoutPanel } from "../BlackoutPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { Inbox } from "lucide-react";
import type { BookingStatus } from "@/types/database";

export default async function PartnerBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);

  type BookingRow = {
    id: string;
    date: string;
    status: string;
    persons_adults: number;
    persons_children: number;
    total_persons: number;
    notes: string | null;
    created_at: string;
    agencies: { business_name: string; phone: string | null } | null;
    excursions: { name: string } | null;
  };

  const [{ data: rawBookings }, { data: rawExcursions }] = await Promise.all([
    supabase
      .from("bookings")
      .select(`id, date, status, persons_adults, persons_children, total_persons, notes, created_at,
        agencies(business_name, phone),
        excursions(name)`)
      .eq("partner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("excursions")
      .select("id, name")
      .eq("partner_id", user.id)
      .eq("active", true)
      .order("name"),
  ]);

  const bookings   = rawBookings as BookingRow[] | null;
  const excursions = (rawExcursions ?? []) as { id: string; name: string }[];

  // Fetch blackouts for partner's excursions
  let blackouts: { excursion_id: string; date: string }[] = [];
  if (excursions.length > 0) {
    const { data: blackoutData } = await supabase
      .from("availability")
      .select("excursion_id, date")
      .in("excursion_id", excursions.map(e => e.id))
      .eq("blackout", true)
      .gte("date", today)
      .order("date")
      .limit(200);
    blackouts = (blackoutData ?? []) as { excursion_id: string; date: string }[];
  }

  return (
    <div className="p-6" style={{ background: "#F4F6F9", minHeight: "100%" }}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Κρατήσεις</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7A8D" }}>Διαχείριση αιτημάτων κράτησης</p>
      </div>

      {/* Two-column layout: bookings table + blackout panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div>
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            {!bookings?.length ? (
              <EmptyState
                icon={Inbox}
                title="Καμία κράτηση ακόμα"
                description="Δεν υπάρχουν κρατήσεις για τις εκδρομές σου. Όταν ένα γραφείο κάνει αίτημα, θα εμφανιστεί εδώ."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #F0F2F5", background: "#FAFBFC" }}>
                      {["Γραφείο", "Εκδρομή", "Ημερομηνία", "Άτομα", "Κατάσταση", "Σημειώσεις", "Ενέργειες"].map(h => (
                        <th key={h} className="text-left px-5 py-3 whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 500, fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => {
                      const agency    = b.agencies;
                      const excursion = b.excursions;
                      return (
                        <tr key={b.id} style={{ borderBottom: "1px solid #F0F2F5" }} className="hover:bg-gray-50/50">
                          <td className="px-5 py-4">
                            <p className="font-medium" style={{ color: "#1B3A5C" }}>{agency?.business_name ?? "—"}</p>
                            {agency?.phone && <p className="text-xs" style={{ color: "#9CA3AF" }}>{agency.phone}</p>}
                          </td>
                          <td className="px-5 py-4" style={{ color: "#6B7A8D" }}>{excursion?.name ?? "—"}</td>
                          <td className="px-5 py-4 whitespace-nowrap" style={{ color: "#6B7A8D" }}>{formatDate(b.date)}</td>
                          <td className="px-5 py-4" style={{ color: "#6B7A8D" }}>
                            <span>{b.total_persons}</span>
                            <span className="text-xs block" style={{ color: "#9CA3AF" }}>{b.persons_adults}ε + {b.persons_children}π</span>
                          </td>
                          <td className="px-5 py-4"><BookingStatusBadge status={b.status as BookingStatus} /></td>
                          <td className="px-5 py-4 max-w-[150px] truncate" style={{ color: "#6B7A8D" }}>{b.notes ?? "—"}</td>
                          <td className="px-5 py-4">
                            <BookingActions bookingId={b.id} status={b.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Blackout panel — sticky on large screens */}
        <div className="lg:sticky lg:top-6">
          <BlackoutPanel excursions={excursions} blackouts={blackouts} />
        </div>
      </div>
    </div>
  );
}
