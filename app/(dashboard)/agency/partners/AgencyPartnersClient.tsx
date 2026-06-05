"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Phone, FileText, Lock, Handshake, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PREFECTURES } from "@/lib/constants/areas";

type Partner = {
  id: string;
  business_name: string;
  afm: string | null;
  phone: string | null;
  description: string | null;
  areas: string[] | null;
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
      cursor: "pointer", whiteSpace: "nowrap",
    }}>
      {label}
    </button>
  );
}

export function AgencyPartnersClient({
  partners,
  connectedIds,
  excursionCounts,
  partnerCategories,
}: {
  partners: Partner[];
  connectedIds: string[];
  excursionCounts: Record<string, number>;
  partnerCategories: Record<string, string[]>;
}) {
  const connSet = useMemo(() => new Set(connectedIds), [connectedIds]);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [section, setSection] = useState<"all" | "connected" | "other">("all");

  const filtered = useMemo(() => partners.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.business_name.toLowerCase().includes(q)) return false;
    if (filterArea && !p.areas?.includes(filterArea)) return false;
    if (filterCat && !(partnerCategories[p.id] ?? []).includes(filterCat)) return false;
    if (section === "connected" && !connSet.has(p.id)) return false;
    if (section === "other" && connSet.has(p.id)) return false;
    return true;
  }), [partners, search, filterArea, filterCat, section, connSet, partnerCategories]);

  const connected   = filtered.filter(p => connSet.has(p.id));
  const unconnected = filtered.filter(p => !connSet.has(p.id));
  const totalConn   = partners.filter(p => connSet.has(p.id)).length;
  const hasFilters  = !!(search || filterArea || filterCat || section !== "all");
  const clearAll    = () => { setSearch(""); setFilterArea(""); setFilterCat(""); setSection("all"); };

  return (
    <div className="p-6" style={{ background: "#F4F6F9", minHeight: "100%" }}>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-navy">Συνεργάτες</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7A8D" }}>
          {totalConn} ενεργές συνεργασίες · {partners.length - totalConn} άλλοι πάροχοι
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl p-4 mb-5" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex flex-wrap gap-3 mb-4">
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9CA3AF" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση παρόχου…"
              style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid #E8ECF0", borderRadius: 8, fontSize: 13, color: "#1B3A5C", outline: "none", background: "#FAFBFC" }} />
          </div>
          <div className="flex gap-1">
            {(["all", "connected", "other"] as const).map(v => (
              <button key={v} type="button" onClick={() => setSection(v)} style={{
                padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                border: "1px solid #E8ECF0",
                background: section === v ? "#1B3A5C" : "white",
                color: section === v ? "white" : "#6B7A8D", cursor: "pointer",
              }}>
                {v === "all" ? "Όλοι" : v === "connected" ? "Συνεργάτες" : "Άλλοι"}
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
            <strong style={{ color: "#1B3A5C" }}>{filtered.length}</strong> από {partners.length} πάροχοι
          </span>
          {hasFilters && (
            <button onClick={clearAll} type="button" style={{ fontSize: 12, color: "#E8A020", fontWeight: 600, border: "none", background: "none", cursor: "pointer" }}>
              Εκκαθάριση
            </button>
          )}
        </div>
      </div>

      {/* ── Connected ── */}
      {(section === "all" || section === "connected") && connected.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1B3A5C" }}>Ενεργές Συνεργασίες</h2>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 10, background: "#D1FAE5", color: "#065F46" }}>{connected.length}</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connected.map(p => (
              <PartnerCard key={p.id} partner={p} connected
                excursionCount={excursionCounts[p.id] ?? 0}
                categories={partnerCategories[p.id] ?? []}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Other ── */}
      {(section === "all" || section === "other") && unconnected.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B7A8D" }}>Άλλοι Πάροχοι</h2>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 10, background: "#F0F2F5", color: "#6B7A8D" }}>{unconnected.length}</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unconnected.map(p => (
              <PartnerCard key={p.id} partner={p}
                excursionCount={excursionCounts[p.id] ?? 0}
                categories={partnerCategories[p.id] ?? []}
              />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl" style={{ border: "1px solid #E8ECF0" }}>
          {partners.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title="Δεν υπάρχουν εγκεκριμένοι πάροχοι"
              description="Δεν υπάρχουν ακόμα εγκεκριμένοι πάροχοι στην πλατφόρμα. Ελέγξτε αργότερα."
            />
          ) : (
            <EmptyState
              icon={SlidersHorizontal}
              title="Δεν βρέθηκαν πάροχοι"
              description="Δεν υπάρχουν πάροχοι που να ταιριάζουν με τα φίλτρα σου. Δοκίμασε να αλλάξεις τα κριτήρια."
            />
          )}
        </div>
      )}
    </div>
  );
}

function PartnerCard({ partner, connected = false, excursionCount, categories }: {
  partner: Partner; connected?: boolean; excursionCount: number; categories: string[];
}) {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3" style={{
      border: connected ? "1px solid rgba(45,155,111,0.3)" : "1px solid #E8ECF0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div className="flex items-start gap-3">
        <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: connected ? "rgba(232,160,32,0.1)" : "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MapPin style={{ width: 18, height: 18, color: connected ? "#E8A020" : "#4F46E5" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-tight" style={{ color: "#1B3A5C" }}>{partner.business_name}</p>
          <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{excursionCount} ενεργές εκδρομές</p>
        </div>
        {connected
          ? <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#D1FAE5", color: "#065F46", whiteSpace: "nowrap", flexShrink: 0 }}>Συνεργάτης</span>
          : <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#9CA3AF", flexShrink: 0 }}><Lock style={{ width: 10, height: 10 }} />Χωρίς σύνδεση</span>
        }
      </div>

      {(partner.phone || partner.afm) && (
        <div style={{ fontSize: 12, color: "#9CA3AF", display: "flex", flexDirection: "column", gap: 4 }}>
          {partner.phone && <span className="flex items-center gap-1.5"><Phone style={{ width: 11, height: 11 }} />{partner.phone}</span>}
          {partner.afm && <span className="flex items-center gap-1.5"><FileText style={{ width: 11, height: 11 }} />ΑΦΜ: {partner.afm}</span>}
        </div>
      )}

      {partner.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#6B7A8D" }}>{partner.description}</p>
      )}

      {partner.areas && partner.areas.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {partner.areas.map(a => (
            <span key={a} style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4, background: "#EEF2FF", color: "#4F46E5" }}>
              {AREA_LABELS[a] ?? a}
            </span>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {categories.map(c => (
            <span key={c} style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4, background: "#FFFBEB", color: "#D97706" }}>
              {CAT_SHORT[c] ?? c}
            </span>
          ))}
        </div>
      )}

      {!connected && (
        <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: "#6B7A8D", lineHeight: 1.5 }}>
          Επικοινωνήστε με τον πάροχο για να σας προσθέσει ως συνεργαζόμενο γραφείο.
        </div>
      )}
    </div>
  );
}
