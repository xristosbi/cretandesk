import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/dashboard/StatsCard";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import { MapPin, CalendarCheck, Clock, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function PartnerOverviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: excursionCount },
    { count: pendingCount },
    { count: monthlyCount },
    { count: completedCount },
    { data: recentBookings },
  ] = await Promise.all([
    supabase
      .from("excursions")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", user.id)
      .eq("active", true),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", user.id)
      .gte("created_at", startOfMonth),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("bookings")
      .select(`
        id,
        date,
        total_persons,
        status,
        created_at,
        agencies ( business_name ),
        excursions ( name )
      `)
      .eq("partner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-navy mb-6">Επισκόπηση</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={MapPin}
          value={excursionCount ?? 0}
          label="Ενεργές Εκδρομές"
        />
        <StatsCard
          icon={Clock}
          value={pendingCount ?? 0}
          label="Εκκρεμείς Κρατήσεις"
        />
        <StatsCard
          icon={CalendarCheck}
          value={monthlyCount ?? 0}
          label="Κρατήσεις Μήνα"
        />
        <StatsCard
          icon={CheckCircle2}
          value={completedCount ?? 0}
          label="Ολοκληρωμένες"
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-navy">Πρόσφατες Κρατήσεις</h2>
        </div>
        {!recentBookings || recentBookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted">
            Δεν υπάρχουν κρατήσεις ακόμα.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left px-6 py-3 text-muted font-medium">Γραφείο</th>
                  <th className="text-left px-6 py-3 text-muted font-medium">Εκδρομή</th>
                  <th className="text-left px-6 py-3 text-muted font-medium">Ημερομηνία</th>
                  <th className="text-left px-6 py-3 text-muted font-medium">Άτομα</th>
                  <th className="text-left px-6 py-3 text-muted font-medium">Κατάσταση</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => {
                  const agency = booking.agencies as { business_name: string } | null;
                  const excursion = booking.excursions as { name: string } | null;
                  return (
                    <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="px-6 py-4 font-medium text-navy">
                        {agency?.business_name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {excursion?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {formatDate(booking.date)}
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {booking.total_persons}
                      </td>
                      <td className="px-6 py-4">
                        <BookingStatusBadge status={booking.status} />
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
