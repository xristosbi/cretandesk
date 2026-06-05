"use client";

import { useState, useMemo } from "react";
import { Search, Building2, Phone, MapPin, FileText, Award, Users, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { AddConnectionButton, RemoveConnectionButton } from "./ConnectionButtons";

type Agency = {
  id: string;
  business_name: string;
  afm: string | null;
  gemi: string | null;
  eot: string | null;
  phone: string | null;
  address: string | null;
};

export function AgenciesClient({
  agencies,
  connectedIds,
}: {
  agencies: Agency[];
  connectedIds: string[];
}) {
  const connSet = useMemo(() => new Set(connectedIds), [connectedIds]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "connected" | "available">("all");
  const [onlyLicensed, setOnlyLicensed] = useState(false);

  const filtered = useMemo(() => agencies.filter(a => {
    if (search && !a.business_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "connected" && !connSet.has(a.id)) return false;
    if (filter === "available" && connSet.has(a.id)) return false;
    if (onlyLicensed && !a.eot && !a.gemi) return false;
    return true;
  }), [agencies, search, filter, onlyLicensed, connSet]);

  const connected  = filtered.filter(a => connSet.has(a.id));
  const available  = filtered.filter(a => !connSet.has(a.id));
  const totalConn  = agencies.filter(a => connSet.has(a.id)).length;
  const hasFilters = !!(search || filter !== "all" || onlyLicensed);
  const clearAll   = () => { setSearch(""); setFilter("all"); setOnlyLicensed(false); };

  return (
    <div className="p-6" style={{ background: "#F4F6F9", minHeight: "100%" }}>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-navy">Γραφεία που Συνεργάζομαι</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7A8D" }}>
          {totalConn} συνεργαζόμενα · {agencies.length - totalConn} διαθέσιμα
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl p-4 mb-5" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex flex-wrap gap-3 mb-4">
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9CA3AF" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση γραφείου…"
              style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid #E8ECF0", borderRadius: 8, fontSize: 13, color: "#1B3A5C", outline: "none", background: "#FAFBFC" }} />
          </div>
          <div className="flex gap-1">
            {(["all", "connected", "available"] as const).map(v => (
              <button key={v} type="button" onClick={() => setFilter(v)} style={{
                padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                border: "1px solid #E8ECF0",
                background: filter === v ? "#1B3A5C" : "white",
                color: filter === v ? "white" : "#6B7A8D", cursor: "pointer",
              }}>
                {v === "all" ? "Όλα" : v === "connected" ? "Συνεργάτες" : "Διαθέσιμα"}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setOnlyLicensed(v => !v)} style={{
            height: 34, padding: "0 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
            border: onlyLicensed ? "none" : "1px solid #E8ECF0",
            background: onlyLicensed ? "#E8A020" : "#FAFBFC",
            color: onlyLicensed ? "white" : "#6B7A8D", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            ΕΟΤ / ΓΕΜΗ Πιστοποιημένα
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span style={{ fontSize: 12, color: "#6B7A8D" }}>
            <strong style={{ color: "#1B3A5C" }}>{filtered.length}</strong> από {agencies.length} γραφεία
          </span>
          {hasFilters && (
            <button onClick={clearAll} type="button" style={{ fontSize: 12, color: "#E8A020", fontWeight: 600, border: "none", background: "none", cursor: "pointer" }}>
              Εκκαθάριση
            </button>
          )}
        </div>
      </div>

      {/* ── Connected ── */}
      {(filter === "all" || filter === "connected") && connected.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1B3A5C" }}>Ενεργές Συνεργασίες</h2>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 10, background: "#D1FAE5", color: "#065F46" }}>{connected.length}</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connected.map(a => (
              <AgencyCard key={a.id} agency={a} connected action={<RemoveConnectionButton agencyId={a.id} />} />
            ))}
          </div>
        </section>
      )}

      {/* ── Available ── */}
      {(filter === "all" || filter === "available") && available.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B7A8D" }}>Διαθέσιμα Γραφεία</h2>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 10, background: "#F0F2F5", color: "#6B7A8D" }}>{available.length}</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map(a => (
              <AgencyCard key={a.id} agency={a} action={<AddConnectionButton agencyId={a.id} />} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl" style={{ border: "1px solid #E8ECF0" }}>
          {agencies.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Δεν υπάρχουν εγκεκριμένα γραφεία"
              description="Δεν υπάρχουν εγκεκριμένα τουριστικά γραφεία στην πλατφόρμα ακόμα. Ελέγξτε αργότερα."
            />
          ) : (
            <EmptyState
              icon={SlidersHorizontal}
              title="Δεν βρέθηκαν γραφεία"
              description="Κανένα γραφείο δεν ταιριάζει με τα τρέχοντα φίλτρα. Δοκίμασε διαφορετική αναζήτηση."
            />
          )}
        </div>
      )}
    </div>
  );
}

function AgencyCard({ agency, connected = false, action }: {
  agency: Agency; connected?: boolean; action: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3" style={{
      border: connected ? "1px solid rgba(45,155,111,0.3)" : "1px solid #E8ECF0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div className="flex items-start gap-3">
        <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: connected ? "rgba(45,155,111,0.1)" : "rgba(27,58,92,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Building2 style={{ width: 18, height: 18, color: connected ? "#2D9B6F" : "#1B3A5C" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-tight" style={{ color: "#1B3A5C" }}>{agency.business_name}</p>
          {connected && <span className="text-xs font-medium" style={{ color: "#2D9B6F" }}>Ενεργή σύνδεση</span>}
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#9CA3AF", display: "flex", flexDirection: "column", gap: 4 }}>
        {agency.phone && <span className="flex items-center gap-1.5"><Phone style={{ width: 11, height: 11 }} />{agency.phone}</span>}
        {agency.address && <span className="flex items-center gap-1.5"><MapPin style={{ width: 11, height: 11 }} /><span className="truncate">{agency.address}</span></span>}
        {agency.afm && <span className="flex items-center gap-1.5"><FileText style={{ width: 11, height: 11 }} />ΑΦΜ: {agency.afm}</span>}
      </div>

      {(agency.gemi || agency.eot) && (
        <div className="flex flex-wrap gap-1.5">
          {agency.gemi && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "#EEF2FF", color: "#4F46E5" }}>
              <Award style={{ width: 10, height: 10 }} />ΓΕΜΗ {agency.gemi}
            </span>
          )}
          {agency.eot && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: "#F0FDF4", color: "#16A34A" }}>
              <Award style={{ width: 10, height: 10 }} />ΕΟΤ {agency.eot}
            </span>
          )}
        </div>
      )}

      <div className="pt-1">{action}</div>
    </div>
  );
}
