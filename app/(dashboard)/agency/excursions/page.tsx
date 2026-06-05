"use client";

import { useEffect, useState, useActionState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { createBooking } from "@/lib/actions/bookings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Search, Clock, Users, MapPin, AlertCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { PREFECTURES } from "@/lib/constants/areas";

type Excursion = {
  id: string; name: string; description: string | null; category: string | null;
  area: string | null; price_per_person: number | null; max_capacity: number | null;
  duration_hours: number | null; photos: string[] | null; partner_id: string;
  created_at: string;
  partners: { business_name: string } | null;
};

const AREA_LABELS: Record<string, string> = {
  heraklion: "Ηράκλειο", chania: "Χανιά", rethymno: "Ρέθυμνο", lasithi: "Λασίθι",
};
const CAT_SHORT: Record<string, string> = {
  sea: "Θαλάσσια", adventure: "Περιπέτεια", aerial: "Εναέρια",
  gastronomy: "Γαστρονομία", culture: "Πολιτισμός", vip: "VIP", niche: "Ειδικές",
};

function Pill({ label, active, onClick, accent = "navy" }: {
  label: string; active: boolean; onClick: () => void; accent?: "navy" | "gold";
}) {
  return (
    <button onClick={onClick} type="button" style={{
      padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: active ? 600 : 500,
      border: active ? "none" : "1px solid #E8ECF0",
      background: active ? (accent === "gold" ? "#E8A020" : "#1B3A5C") : "white",
      color: active ? "white" : "#6B7A8D",
      cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.15s",
    }}>
      {label}
    </button>
  );
}

export default function AgencyExcursionsPage() {
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [availableIds, setAvailableIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Excursion | null>(null);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [state, action, pending] = useActionState(createBooking, { error: null });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      supabase.from("partner_agency_connections")
        .select("partner_id")
        .eq("agency_id", user.id)
        .eq("status", "approved")
        .then(({ data: conns }) => {
          if (!conns?.length) { setLoading(false); return; }
          const partnerIds = conns.map(c => c.partner_id);
          supabase.from("excursions")
            .select("*, partners(business_name)")
            .in("partner_id", partnerIds)
            .eq("active", true)
            .order("created_at", { ascending: false })
            .then(({ data }) => {
              const rows = (data as Excursion[]) ?? [];
              setExcursions(rows);
              setLoading(false);
              if (!rows.length) return;
              const today = new Date().toISOString().slice(0, 10);
              supabase.from("availability")
                .select("excursion_id")
                .in("excursion_id", rows.map(e => e.id))
                .gte("date", today)
                .gt("available_slots", 0)
                .eq("blackout", false)
                .then(({ data: av }) =>
                  setAvailableIds(new Set((av ?? []).map(a => a.excursion_id)))
                );
            });
        });
    });
  }, []);

  useEffect(() => {
    if (!state?.error && state !== null && !pending && selected) {
      setSuccess(true);
      setTimeout(() => { setSelected(null); setSuccess(false); }, 2000);
    }
  }, [state, pending]);

  const filtered = useMemo(() => {
    let list = excursions.filter(e => {
      const q = search.toLowerCase();
      const partner = e.partners as { business_name: string } | null;
      if (q && !e.name.toLowerCase().includes(q) && !partner?.business_name?.toLowerCase().includes(q)) return false;
      if (filterArea && e.area !== filterArea) return false;
      if (filterCat && e.category !== filterCat) return false;
      if (onlyAvailable && !availableIds.has(e.id)) return false;
      return true;
    });
    if (sortBy === "price_asc") list = [...list].sort((a, b) => (a.price_per_person ?? 0) - (b.price_per_person ?? 0));
    if (sortBy === "price_desc") list = [...list].sort((a, b) => (b.price_per_person ?? 0) - (a.price_per_person ?? 0));
    return list;
  }, [excursions, search, filterArea, filterCat, onlyAvailable, availableIds, sortBy]);

  const hasFilters = !!(search || filterArea || filterCat || onlyAvailable || sortBy !== "newest");
  const clearAll = () => { setSearch(""); setFilterArea(""); setFilterCat(""); setOnlyAvailable(false); setSortBy("newest"); };

  return (
    <div className="p-6" style={{ background: "#F4F6F9", minHeight: "100%" }}>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-navy">Εκδρομές</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7A8D" }}>Αίτημα κράτησης εκδρομής</p>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl p-4 mb-5" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex flex-wrap gap-3 mb-4">
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9CA3AF" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Αναζήτηση εκδρομής ή παρόχου…"
              style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid #E8ECF0", borderRadius: 8, fontSize: 13, color: "#1B3A5C", outline: "none", background: "#FAFBFC" }} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            style={{ height: 34, border: "1px solid #E8ECF0", borderRadius: 8, padding: "0 12px", fontSize: 13, color: "#1B3A5C", background: "#FAFBFC", cursor: "pointer" }}>
            <option value="newest">Νεότερα πρώτα</option>
            <option value="price_asc">Τιμή: χαμηλή → υψηλή</option>
            <option value="price_desc">Τιμή: υψηλή → χαμηλή</option>
          </select>
          <button type="button" onClick={() => setOnlyAvailable(v => !v)} style={{
            height: 34, padding: "0 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
            border: onlyAvailable ? "none" : "1px solid #E8ECF0",
            background: onlyAvailable ? "#1B3A5C" : "#FAFBFC",
            color: onlyAvailable ? "white" : "#6B7A8D", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            ✓ Μόνο Διαθέσιμα
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3 items-center">
          <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Περιοχή</span>
          <Pill label="Όλες" active={!filterArea} onClick={() => setFilterArea("")} />
          {PREFECTURES.map(p => (
            <Pill key={p.value} label={AREA_LABELS[p.value] ?? p.label} active={filterArea === p.value}
              onClick={() => setFilterArea(filterArea === p.value ? "" : p.value)} />
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Κατηγορία</span>
          <Pill label="Όλες" active={!filterCat} onClick={() => setFilterCat("")} accent="gold" />
          {Object.entries(CAT_SHORT).map(([k, v]) => (
            <Pill key={k} label={v} active={filterCat === k} onClick={() => setFilterCat(filterCat === k ? "" : k)} accent="gold" />
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #F0F2F5" }}>
          <span style={{ fontSize: 12, color: "#6B7A8D" }}>
            <strong style={{ color: "#1B3A5C" }}>{filtered.length}</strong> από {excursions.length} εκδρομές
          </span>
          {hasFilters && (
            <button onClick={clearAll} type="button" style={{ fontSize: 12, color: "#E8A020", fontWeight: 600, border: "none", background: "none", cursor: "pointer" }}>
              Εκκαθάριση φίλτρων
            </button>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="text-center py-20 text-sm" style={{ color: "#9CA3AF" }}>Φόρτωση εκδρομών…</div>
      ) : !filtered.length ? (
        <div className="bg-white rounded-2xl p-16 text-center" style={{ border: "1px solid #E8ECF0" }}>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            {excursions.length === 0 ? "Δεν υπάρχουν διαθέσιμες εκδρομές." : "Δεν βρέθηκαν αποτελέσματα."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(ex => {
            const partner = ex.partners as { business_name: string } | null;
            const isAvail = availableIds.has(ex.id);
            return (
              <div key={ex.id} className="bg-white rounded-2xl overflow-hidden flex flex-col"
                style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ height: 140, background: "#F4F6F9", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {ex.photos?.[0]
                    ? <img src={ex.photos[0]} alt={ex.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <ImageIcon style={{ width: 32, height: 32, color: "#D1D5DB" }} />}
                  {ex.area && (
                    <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(27,58,92,0.85)", color: "white", fontSize: 10, fontWeight: 600, borderRadius: 6, padding: "3px 8px" }}>
                      {AREA_LABELS[ex.area] ?? ex.area}
                    </span>
                  )}
                  <span style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: "50%", background: isAvail ? "#2D9B6F" : "#E5E7EB", border: "1.5px solid white" }} title={isAvail ? "Διαθέσιμο" : "Χωρίς διαθεσιμότητα"} />
                </div>
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div>
                    <h3 className="font-semibold text-sm leading-tight" style={{ color: "#1B3A5C" }}>{ex.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{partner?.business_name ?? "—"}</p>
                  </div>
                  {ex.category && (
                    <span style={{ alignSelf: "flex-start", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "#FFFBEB", color: "#D97706" }}>
                      {CAT_SHORT[ex.category] ?? ex.category}
                    </span>
                  )}
                  <div className="flex flex-col gap-1 text-xs" style={{ color: "#9CA3AF" }}>
                    <span className="flex items-center gap-1 font-medium" style={{ color: "#1B3A5C" }}>
                      <MapPin style={{ width: 11, height: 11, color: "#9CA3AF", flexShrink: 0 }} />
                      {ex.price_per_person != null ? `${formatCurrency(ex.price_per_person)}/άτομο` : "—"}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Users style={{ width: 11, height: 11, flexShrink: 0 }} />{ex.max_capacity ?? "—"} θέσεις</span>
                      <span className="flex items-center gap-1"><Clock style={{ width: 11, height: 11, flexShrink: 0 }} />{ex.duration_hours != null ? `${ex.duration_hours}ω` : "—"}</span>
                    </span>
                  </div>
                  <button onClick={() => setSelected(ex)} type="button" className="mt-auto"
                    style={{ width: "100%", padding: "8px 0", borderRadius: 8, background: "#1B3A5C", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
                    Αίτημα Κράτησης
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Booking dialog ── */}
      <Dialog open={!!selected} onOpenChange={o => { if (!o) setSelected(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Αίτημα Κράτησης</DialogTitle>
            <DialogDescription>{selected?.name}</DialogDescription>
          </DialogHeader>
          {success ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-4 py-3 text-sm">
              <CheckCircle2 className="h-4 w-4" />Το αίτημα υποβλήθηκε!
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <input type="hidden" name="excursion_id" value={selected?.id ?? ""} />
              <input type="hidden" name="partner_id" value={selected?.partner_id ?? ""} />
              {state?.error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle className="h-4 w-4" />{state.error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="date">Ημερομηνία <span className="text-danger">*</span></Label>
                <Input id="date" name="date" type="date" required min={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="adults">Ενήλικες</Label>
                  <Input id="adults" name="persons_adults" type="number" min="0" defaultValue="1" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="children">Παιδιά</Label>
                  <Input id="children" name="persons_children" type="number" min="0" defaultValue="0" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Σημειώσεις</Label>
                <Input id="notes" name="notes" placeholder="Ειδικές απαιτήσεις…" />
              </div>
              <button type="submit" disabled={pending} style={{
                width: "100%", padding: "10px 0", borderRadius: 8,
                background: pending ? "#E5E7EB" : "#1B3A5C",
                color: pending ? "#9CA3AF" : "white",
                fontSize: 14, fontWeight: 600, border: "none", cursor: pending ? "not-allowed" : "pointer",
              }}>
                {pending ? "Υποβολή…" : "Υποβολή Αιτήματος"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
