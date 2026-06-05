"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { toggleExcursionActive, deleteExcursion } from "@/lib/actions/excursions";
import { formatCurrency } from "@/lib/utils";
import { Plus, MapPin, Clock, Users, Image as ImageIcon, Search } from "lucide-react";
import { PREFECTURES } from "@/lib/constants/areas";

type Excursion = {
  id: string; name: string; description: string | null; category: string | null;
  area: string | null; price_per_person: number | null; max_capacity: number | null;
  duration_hours: number | null; photos: string[] | null; active: boolean; created_at: string;
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
      color: active ? "white" : "#6B7A8D", cursor: "pointer", whiteSpace: "nowrap",
    }}>
      {label}
    </button>
  );
}

export function ExcursionsList({ excursions }: { excursions: Excursion[] }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const filtered = useMemo(() => excursions.filter(e => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && e.category !== filterCat) return false;
    if (filterArea && e.area !== filterArea) return false;
    if (filterStatus === "active" && !e.active) return false;
    if (filterStatus === "inactive" && e.active) return false;
    return true;
  }), [excursions, search, filterCat, filterArea, filterStatus]);

  const hasFilters = !!(search || filterCat || filterArea || filterStatus !== "all");
  const clearAll = () => { setSearch(""); setFilterCat(""); setFilterArea(""); setFilterStatus("all"); };

  return (
    <div className="p-6" style={{ background: "#F4F6F9", minHeight: "100%" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Εκδρομές</h1>
          <p className="text-sm mt-1" style={{ color: "#6B7A8D" }}>{excursions.length} εκδρομές</p>
        </div>
        <Link href="/partner/excursions/new">
          <button type="button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, background: "#1B3A5C", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Plus style={{ width: 15, height: 15 }} />Νέα Εκδρομή
          </button>
        </Link>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl p-4 mb-5" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex flex-wrap gap-3 mb-4">
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9CA3AF" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση εκδρομής…"
              style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid #E8ECF0", borderRadius: 8, fontSize: 13, color: "#1B3A5C", outline: "none", background: "#FAFBFC" }} />
          </div>
          <div className="flex gap-1">
            {(["all", "active", "inactive"] as const).map(v => (
              <button key={v} type="button" onClick={() => setFilterStatus(v)} style={{
                padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                border: "1px solid #E8ECF0",
                background: filterStatus === v ? "#1B3A5C" : "white",
                color: filterStatus === v ? "white" : "#6B7A8D", cursor: "pointer",
              }}>
                {v === "all" ? "Όλες" : v === "active" ? "Ενεργές" : "Ανενεργές"}
              </button>
            ))}
          </div>
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
              Εκκαθάριση
            </button>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      {!filtered.length ? (
        <div className="bg-white rounded-2xl p-16 text-center" style={{ border: "1px solid #E8ECF0" }}>
          {excursions.length === 0 ? (
            <>
              <MapPin style={{ width: 36, height: 36, color: "#D1D5DB", margin: "0 auto 12px" }} />
              <p className="font-medium text-sm mb-1" style={{ color: "#1B3A5C" }}>Δεν έχεις εκδρομές ακόμα</p>
              <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>Δημιούργησε την πρώτη σου εκδρομή</p>
              <Link href="/partner/excursions/new">
                <button type="button" style={{ padding: "8px 18px", borderRadius: 8, background: "#1B3A5C", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
                  Νέα Εκδρομή
                </button>
              </Link>
            </>
          ) : (
            <p className="text-sm" style={{ color: "#9CA3AF" }}>Δεν βρέθηκαν αποτελέσματα.</p>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(ex => (
            <div key={ex.id} className="bg-white rounded-2xl overflow-hidden"
              style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ height: 140, background: "#F4F6F9", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {ex.photos?.[0]
                  ? <img src={ex.photos[0]} alt={ex.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <ImageIcon style={{ width: 32, height: 32, color: "#D1D5DB" }} />}
                <span style={{
                  position: "absolute", top: 10, right: 10,
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                  background: ex.active ? "#D1FAE5" : "#F3F4F6",
                  color: ex.active ? "#065F46" : "#9CA3AF",
                }}>
                  {ex.active ? "Ενεργή" : "Ανενεργή"}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm leading-tight" style={{ color: "#1B3A5C" }}>{ex.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {ex.category && (
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4, background: "#FFFBEB", color: "#D97706" }}>
                        {CAT_SHORT[ex.category] ?? ex.category}
                      </span>
                    )}
                    {ex.area && (
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4, background: "#EEF2FF", color: "#4F46E5" }}>
                        {AREA_LABELS[ex.area] ?? ex.area}
                      </span>
                    )}
                  </div>
                </div>
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
                <div className="flex gap-2 pt-1">
                  <form action={toggleExcursionActive.bind(null, ex.id, !ex.active)} className="flex-1">
                    <button type="submit" style={{ width: "100%", padding: "6px 0", borderRadius: 7, fontSize: 12, fontWeight: 500, border: "1px solid #E8ECF0", background: "white", color: "#6B7A8D", cursor: "pointer" }}>
                      {ex.active ? "Απενεργοποίηση" : "Ενεργοποίηση"}
                    </button>
                  </form>
                  <form action={deleteExcursion.bind(null, ex.id)}>
                    <button type="submit" style={{ padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 500, background: "#FEE2E2", color: "#991B1B", border: "none", cursor: "pointer" }}>
                      Διαγραφή
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
