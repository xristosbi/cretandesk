import { createClient } from "@/lib/supabase/server";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import { formatDate } from "@/lib/utils";
import type { BookingStatus } from "@/types/database";

export default async function AgencyBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  type BookingRow = {
    id: string;
    date: string;
    status: string;
    total_persons: number;
    persons_adults: number;
    persons_children: number;
    notes: string | null;
    created_at: string;
    excursions: { name: string; price_per_person: number | null } | null;
    partners: { business_name: string } | null;
  };

  const { data: rawBookings } = await supabase
    .from("bookings")
    .select(`id, date, status, total_persons, persons_adults, persons_children, notes, created_at,
      excursions(name, price_per_person),
      partners(business_name)`)
    .eq("agency_id", user.id)
    .order("created_at", { ascending: false });

  const bookings = rawBookings as BookingRow[] | null;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Κρατήσεις μου</h1>
        <p className="text-muted text-sm mt-1">{bookings?.length ?? 0} κρατήσεις συνολικά</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {!bookings?.length ? (
          <div className="py-16 text-center text-muted">Δεν έχεις κρατήσεις ακόμα.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  {["Εκδρομή", "Πάροχος", "Ημερομηνία", "Άτομα", "Κατάσταση", "Σημειώσεις", "Υποβλήθηκε"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-muted font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const excursion = b.excursions as { name: string; price_per_person: number | null } | null;
                  const partner = b.partners as { business_name: string } | null;
                  return (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="px-5 py-4 font-medium text-navy">{excursion?.name ?? "—"}</td>
                      <td className="px-5 py-4 text-muted">{partner?.business_name ?? "—"}</td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">{formatDate(b.date)}</td>
                      <td className="px-5 py-4 text-muted">
                        {b.total_persons}
                        <span className="text-xs block text-muted/70">{b.persons_adults}ε + {b.persons_children}π</span>
                      </td>
                      <td className="px-5 py-4"><BookingStatusBadge status={b.status as BookingStatus} /></td>
                      <td className="px-5 py-4 text-muted max-w-[140px] truncate">{b.notes ?? "—"}</td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">{formatDate(b.created_at)}</td>
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
