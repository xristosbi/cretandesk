import { createClient } from "@/lib/supabase/server";
import { AnalyticsCharts, type CategoryCount, type MonthlyCount, type MonthlyRevenue } from "@/components/dashboard/AnalyticsCharts";
import { getParentCategory } from "@/lib/constants/categories";

const CATEGORY_LABELS: Record<string, string> = {
  sea: "Θάλασσα", adventure: "Περιπέτεια & Φύση", aerial: "Αέρας",
  gastronomy: "Γεύση & Παράδοση", culture: "Πολιτισμός", vip: "VIP", niche: "Εναλλακτικά",
};
const CATEGORY_KEYS = ["sea", "adventure", "aerial", "gastronomy", "culture", "vip", "niche"];

const AREA_LABELS: Record<string, string> = {
  heraklion: "Ηράκλειο", chania: "Χανιά", rethymno: "Ρέθυμνο", lasithi: "Λασίθι",
};

// Returns last N months as "YYYY-MM" strings, oldest first
function lastNMonths(n: number): string[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return d.toISOString().slice(0, 7);
  });
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    { data: bookingsByStatus },
    { data: excursionsByCategory },
    { data: excursionsByArea },
    { data: allBookings },
    { data: allFees },
  ] = await Promise.all([
    supabase.from("bookings").select("status"),
    supabase.from("excursions").select("category").eq("active", true),
    supabase.from("excursions").select("area").eq("active", true),
    supabase
      .from("bookings")
      .select("id, created_at, excursions(category)")
      .gte("created_at", sixMonthsAgo.toISOString()),
    supabase.from("service_fees").select("amount, period"),
  ]);

  // ── Status counts ─────────────────────────────────────────────────────────
  const statusCounts = (bookingsByStatus ?? []).reduce((acc: Record<string, number>, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  // ── Excursion bar charts (progress bars) ──────────────────────────────────
  const categoryCounts = (excursionsByCategory ?? []).reduce((acc: Record<string, number>, e) => {
    const parent = e.category ? getParentCategory(e.category) : null;
    if (parent) acc[parent] = (acc[parent] ?? 0) + 1;
    return acc;
  }, {});
  const areaCounts = (excursionsByArea ?? []).reduce((acc: Record<string, number>, e) => {
    if (e.area) acc[e.area] = (acc[e.area] ?? 0) + 1;
    return acc;
  }, {});

  // ── Chart data ────────────────────────────────────────────────────────────
  const months = lastNMonths(6);

  // Bookings by category (from joined bookings)
  const bookingCatCounts: Record<string, number> = {};
  for (const b of (allBookings ?? [])) {
    const subcat = (b.excursions as { category: string | null } | null)?.category ?? null;
    const cat    = subcat ? getParentCategory(subcat) : null;
    if (cat) bookingCatCounts[cat] = (bookingCatCounts[cat] ?? 0) + 1;
  }
  const categoryData: CategoryCount[] = CATEGORY_KEYS.map(k => ({
    label: CATEGORY_LABELS[k],
    count: bookingCatCounts[k] ?? 0,
  }));

  // Monthly booking counts
  const monthlyBookings: MonthlyCount[] = months.map(m => ({
    month: m,
    count: (allBookings ?? []).filter(b => b.created_at.startsWith(m)).length,
  }));

  // Monthly revenue from service fees
  const revByPeriod: Record<string, number> = {};
  for (const f of (allFees ?? [])) {
    if (f.period) {
      revByPeriod[f.period] = (revByPeriod[f.period] ?? 0) + Number(f.amount);
    }
  }
  const monthlyRevenue: MonthlyRevenue[] = months.map(m => ({
    month: m,
    revenue: revByPeriod[m] ?? 0,
  }));

  return (
    <div className="p-6 space-y-6" style={{ background: "#F4F6F9", minHeight: "100%" }}>
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Αναλυτικά</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7A8D" }}>Στατιστικά πλατφόρμας CretanDesk</p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: "pending",   label: "Εκκρεμείς",    bg: "#FEF3C7", fg: "#92400E" },
          { key: "accepted",  label: "Αποδεκτές",     bg: "#D1FAE5", fg: "#065F46" },
          { key: "rejected",  label: "Απορριφθείσες", bg: "#FEE2E2", fg: "#991B1B" },
          { key: "completed", label: "Ολοκληρωμένες", bg: "#DBEAFE", fg: "#1E40AF" },
        ].map(({ key, label, bg, fg }) => (
          <div key={key} className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <p className="text-3xl font-bold" style={{ color: "#1B3A5C" }}>{statusCounts[key] ?? 0}</p>
            <span style={{ display: "inline-block", marginTop: 8, padding: "3px 10px", borderRadius: 20, background: bg, color: fg, fontSize: 12, fontWeight: 500 }}>
              {label}
            </span>
            {total > 0 && (
              <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                {Math.round(((statusCounts[key] ?? 0) / total) * 100)}% του συνόλου
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Chart.js charts */}
      <AnalyticsCharts
        categoryData={categoryData}
        monthlyBookings={monthlyBookings}
        monthlyRevenue={monthlyRevenue}
      />

      {/* Progress bar breakdowns */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 className="font-semibold text-base mb-4" style={{ color: "#1B3A5C" }}>Ενεργές εκδρομές ανά κατηγορία</h3>
          <div className="space-y-3">
            {CATEGORY_KEYS.map(k => {
              const count   = categoryCounts[k] ?? 0;
              const maxCat  = Math.max(...Object.values(categoryCounts), 1);
              return (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-sm shrink-0" style={{ color: "#6B7A8D", width: 100 }}>{CATEGORY_LABELS[k]}</span>
                  <div className="flex-1 rounded-full" style={{ background: "#F0F4F8", height: 6 }}>
                    <div className="rounded-full" style={{ width: `${(count / maxCat) * 100}%`, height: 6, background: "#1B3A5C", transition: "width 0.4s" }} />
                  </div>
                  <span className="text-sm font-semibold w-5 text-right" style={{ color: "#1B3A5C" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 className="font-semibold text-base mb-4" style={{ color: "#1B3A5C" }}>Ενεργές εκδρομές ανά περιοχή</h3>
          <div className="space-y-3">
            {Object.entries(AREA_LABELS).map(([k, label]) => {
              const count    = areaCounts[k] ?? 0;
              const maxArea  = Math.max(...Object.values(areaCounts), 1);
              return (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-sm shrink-0" style={{ color: "#6B7A8D", width: 100 }}>{label}</span>
                  <div className="flex-1 rounded-full" style={{ background: "#F0F4F8", height: 6 }}>
                    <div className="rounded-full" style={{ width: `${(count / maxArea) * 100}%`, height: 6, background: "#E8A020", transition: "width 0.4s" }} />
                  </div>
                  <span className="text-sm font-semibold w-5 text-right" style={{ color: "#1B3A5C" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
