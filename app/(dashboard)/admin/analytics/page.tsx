import { createClient } from "@/lib/supabase/server";

const categoryLabels: Record<string, string> = {
  sea: "Θαλάσσια", adventure: "Περιπέτεια", aerial: "Εναέρια",
  gastronomy: "Γαστρονομία", culture: "Πολιτισμός", vip: "VIP", niche: "Ειδικές",
};
const areaLabels: Record<string, string> = {
  heraklion: "Ηράκλειο", chania: "Χανιά", rethymno: "Ρέθυμνο", lasithi: "Λασίθι",
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [
    { data: bookingsByStatus },
    { data: excursionsByCategory },
    { data: excursionsByArea },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from("bookings").select("status"),
    supabase.from("excursions").select("category").eq("active", true),
    supabase.from("excursions").select("area").eq("active", true),
    supabase.from("bookings").select("created_at, status").order("created_at", { ascending: false }).limit(30),
  ]);

  const statusCounts = (bookingsByStatus ?? []).reduce((acc: Record<string, number>, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  const categoryCounts = (excursionsByCategory ?? []).reduce((acc: Record<string, number>, e) => {
    if (e.category) acc[e.category] = (acc[e.category] ?? 0) + 1;
    return acc;
  }, {});

  const areaCounts = (excursionsByArea ?? []).reduce((acc: Record<string, number>, e) => {
    if (e.area) acc[e.area] = (acc[e.area] ?? 0) + 1;
    return acc;
  }, {});

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Αναλυτικά</h1>
        <p className="text-muted text-sm mt-1">Στατιστικά πλατφόρμας</p>
      </div>

      {/* Bookings by status */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-navy mb-4">Κρατήσεις ανά κατάσταση</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { key: "pending",   label: "Εκκρεμείς",      color: "bg-amber-100 text-amber-800"  },
            { key: "accepted",  label: "Αποδεκτές",       color: "bg-green-100 text-green-800"  },
            { key: "rejected",  label: "Απορριφθείσες",   color: "bg-red-100   text-red-800"    },
            { key: "completed", label: "Ολοκληρωμένες",   color: "bg-blue-100  text-blue-800"   },
          ].map(({ key, label, color }) => (
            <div key={key} className={`rounded-xl p-4 ${color}`}>
              <p className="text-3xl font-bold">{statusCounts[key] ?? 0}</p>
              <p className="text-sm mt-1">{label}</p>
              {total > 0 && <p className="text-xs mt-0.5 opacity-70">{Math.round(((statusCounts[key] ?? 0) / total) * 100)}%</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Excursions by category */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-navy mb-4">Εκδρομές ανά κατηγορία</h2>
          <div className="space-y-3">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const count = categoryCounts[key] ?? 0;
              const maxCat = Math.max(...Object.values(categoryCounts), 1);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-muted w-28 shrink-0">{label}</span>
                  <div className="flex-1 bg-background rounded-full h-2">
                    <div className="bg-navy rounded-full h-2 transition-all" style={{ width: `${(count / maxCat) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-navy w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Excursions by area */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-navy mb-4">Εκδρομές ανά περιοχή</h2>
          <div className="space-y-3">
            {Object.entries(areaLabels).map(([key, label]) => {
              const count = areaCounts[key] ?? 0;
              const maxArea = Math.max(...Object.values(areaCounts), 1);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-muted w-28 shrink-0">{label}</span>
                  <div className="flex-1 bg-background rounded-full h-2">
                    <div className="bg-gold rounded-full h-2 transition-all" style={{ width: `${(count / maxArea) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-navy w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
