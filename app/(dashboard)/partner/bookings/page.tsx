import { createClient } from "@/lib/supabase/server";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import { BookingActions } from "./BookingActions";
import { formatDate } from "@/lib/utils";
import type { BookingStatus } from "@/types/database";

export default async function PartnerBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

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

  const { data: rawBookings } = await supabase
    .from("bookings")
    .select(`id, date, status, persons_adults, persons_children, total_persons, notes, created_at,
      agencies(business_name, phone),
      excursions(name)`)
    .eq("partner_id", user.id)
    .order("created_at", { ascending: false });

  const bookings = rawBookings as BookingRow[] | null;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Κρατήσεις</h1>
        <p className="text-muted text-sm mt-1">Διαχείριση αιτημάτων κράτησης</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {!bookings?.length ? (
          <div className="py-16 text-center text-muted">Δεν υπάρχουν κρατήσεις ακόμα.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  {["Γραφείο", "Εκδρομή", "Ημερομηνία", "Άτομα", "Κατάσταση", "Σημειώσεις", "Ενέργειες"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-muted font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const agency = b.agencies;
                  const excursion = b.excursions;
                  return (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-navy">{agency?.business_name ?? "—"}</p>
                        {agency?.phone && <p className="text-xs text-muted">{agency.phone}</p>}
                      </td>
                      <td className="px-5 py-4 text-muted">{excursion?.name ?? "—"}</td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">{formatDate(b.date)}</td>
                      <td className="px-5 py-4 text-muted">
                        <span>{b.total_persons}</span>
                        <span className="text-xs block text-muted/70">{b.persons_adults}ε + {b.persons_children}π</span>
                      </td>
                      <td className="px-5 py-4"><BookingStatusBadge status={b.status as BookingStatus} /></td>
                      <td className="px-5 py-4 text-muted max-w-[150px] truncate">{b.notes ?? "—"}</td>
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
  );
}
