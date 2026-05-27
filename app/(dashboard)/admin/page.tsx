import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/dashboard/StatsCard";
import { approveUser } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Clock, CalendarCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { UserRole } from "@/types/database";

const roleLabels: Record<string, string> = { partner: "Πάροχος", agency: "Γραφείο", admin: "Admin" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: partnerCount },
    { count: agencyCount },
    { count: pendingCount },
    { count: bookingCount },
    { data: pendingUsers },
  ] = await Promise.all([
    supabase.from("partners").select("*", { count: "exact", head: true }),
    supabase.from("agencies").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("id, email, role, status, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Πίνακας Ελέγχου</h1>
        <p className="text-muted text-sm mt-1">Διαχείριση πλατφόρμας CretanDesk</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Building2}    value={partnerCount ?? 0}  label="Πάροχοι" />
        <StatsCard icon={Users}        value={agencyCount ?? 0}   label="Γραφεία" />
        <StatsCard icon={Clock}        value={pendingCount ?? 0}  label="Εκκρεμείς εγκρίσεις" />
        <StatsCard icon={CalendarCheck} value={bookingCount ?? 0} label="Συνολικές κρατήσεις" />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-navy">Εκκρεμείς Εγκρίσεις</h2>
          {(pendingCount ?? 0) > 0 && <Badge variant="pending">{pendingCount} εκκρεμείς</Badge>}
        </div>
        {!pendingUsers?.length ? (
          <div className="py-12 text-center text-muted">Δεν υπάρχουν εκκρεμείς εγκρίσεις.</div>
        ) : (
          <div className="divide-y divide-border">
            {pendingUsers.map((u) => (
              <div key={u.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-navy text-sm">{u.email}</p>
                  <p className="text-xs text-muted mt-0.5">{u.role ? roleLabels[u.role] : "Χωρίς ρόλο"} · Εγγραφή {formatDate(u.created_at)}</p>
                </div>
                {u.role && u.role !== "admin" ? (
                  <form action={approveUser.bind(null, u.id, u.role as UserRole)}>
                    <Button type="submit" size="sm">Έγκριση</Button>
                  </form>
                ) : (
                  <Badge variant="muted">Χωρίς ρόλο</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
