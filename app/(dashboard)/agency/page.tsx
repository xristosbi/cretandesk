import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/dashboard/StatsCard";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import { Clock, CalendarCheck, CheckCircle2, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BookingStatus } from "@/types/database";

export default async function AgencyOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  type UpcomingRow = {
    id: string;
    date: string;
    total_persons: number;
    status: string;
    excursions: { name: string } | null;
    partners: { business_name: string } | null;
  };
  type AgencyRow = { business_name: string } | null;

  const [
    { count: pendingCount },
    { count: acceptedCount },
    { count: monthCount },
    { count: completedCount },
    { data: rawUpcoming },
    { data: rawAgency },
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("agency_id", user.id).eq("status", "pending"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("agency_id", user.id).eq("status", "accepted"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("agency_id", user.id).gte("created_at", monthStart),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("agency_id", user.id).eq("status", "completed"),
    supabase.from("bookings").select(`id, date, total_persons, status, excursions(name), partners(business_name)`)
      .eq("agency_id", user.id).eq("status", "accepted").gte("date", today).order("date").limit(5),
    supabase.from("agencies").select("business_name").eq("id", user.id).single(),
  ]);

  const upcoming = rawUpcoming as UpcomingRow[] | null;
  const agency = rawAgency as AgencyRow;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">
          Καλημέρα{agency?.business_name ? `, ${agency.business_name}` : ""}
        </h1>
        <p className="text-muted text-sm mt-1">Επισκόπηση κρατήσεών σου</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Clock}        value={pendingCount ?? 0}   label="Εκκρεμείς κρατήσεις" />
        <StatsCard icon={CalendarCheck} value={acceptedCount ?? 0} label="Επιβεβαιωμένες" />
        <StatsCard icon={TrendingUp}   value={monthCount ?? 0}     label="Κρατήσεις μήνα" />
        <StatsCard icon={CheckCircle2} value={completedCount ?? 0} label="Ολοκληρωμένες" />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-navy">Επερχόμενες Κρατήσεις</h2>
        </div>
        {!upcoming?.length ? (
          <div className="py-12 text-center text-muted">Δεν υπάρχουν επερχόμενες κρατήσεις.</div>
        ) : (
          <div className="divide-y divide-border">
            {upcoming.map((b) => {
              const excursion = b.excursions;
              const partner = b.partners;
              return (
                <div key={b.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-navy text-sm">{excursion?.name ?? "—"}</p>
                    <p className="text-xs text-muted mt-0.5">{partner?.business_name ?? "—"} · {formatDate(b.date)} · {b.total_persons} άτομα</p>
                  </div>
                  <BookingStatusBadge status={b.status as BookingStatus} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
