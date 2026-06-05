"use client";

import { useState, useTransition, useMemo } from "react";
import { ChevronLeft, ChevronRight, Ban, Trash2 } from "lucide-react";
import { setBlackout, removeBlackout } from "@/lib/actions/availability";

const DAYS_SHORT = ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σά", "Κυ"];
const MONTHS_EL = [
  "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος",
  "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος",
  "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος",
];

type Excursion = { id: string; name: string };
type BlackoutRecord = { excursion_id: string; date: string };

type Props = {
  excursions: Excursion[];
  blackouts: BlackoutRecord[];
};

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export function BlackoutPanel({ excursions, blackouts: initialBlackouts }: Props) {
  const now = new Date();
  const [year, setYear]         = useState(now.getFullYear());
  const [month, setMonth]       = useState(now.getMonth());
  const [selectedId, setSelectedId] = useState(excursions[0]?.id ?? "");
  const [blackouts, setBlackouts]   = useState<BlackoutRecord[]>(initialBlackouts);
  const [pending, startTransition]  = useTransition();

  const today = now.toISOString().slice(0, 10);

  const blackoutSet = useMemo(
    () => new Set(blackouts.filter(b => b.excursion_id === selectedId).map(b => b.date)),
    [blackouts, selectedId]
  );

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const firstDow    = new Date(year, month, 1).getDay();
  const startOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function toggleDate(dateStr: string) {
    if (!selectedId || pending) return;
    const wasBlackout = blackoutSet.has(dateStr);

    // Optimistic update
    if (wasBlackout) {
      setBlackouts(prev => prev.filter(b => !(b.excursion_id === selectedId && b.date === dateStr)));
    } else {
      setBlackouts(prev => [...prev, { excursion_id: selectedId, date: dateStr }]);
    }

    startTransition(async () => {
      try {
        if (wasBlackout) {
          await removeBlackout(selectedId, dateStr);
        } else {
          await setBlackout(selectedId, dateStr);
        }
      } catch {
        // Rollback on error
        if (wasBlackout) {
          setBlackouts(prev => [...prev, { excursion_id: selectedId, date: dateStr }]);
        } else {
          setBlackouts(prev => prev.filter(b => !(b.excursion_id === selectedId && b.date === dateStr)));
        }
      }
    });
  }

  const upcomingBlackouts = blackouts
    .filter(b => b.excursion_id === selectedId && b.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 12);

  if (!excursions.length) {
    return (
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Ban style={{ width: 16, height: 16, color: "#D94040" }} />
          <h2 className="font-semibold text-base" style={{ color: "#1B3A5C" }}>Κλείσιμο Ημερών</h2>
        </div>
        <p className="text-sm" style={{ color: "#9CA3AF" }}>Δεν υπάρχουν ενεργές εκδρομές.</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #F0F2F5" }}>
        <div className="flex items-center gap-2 mb-0.5">
          <Ban style={{ width: 15, height: 15, color: "#D94040" }} />
          <h2 className="font-semibold text-base" style={{ color: "#1B3A5C" }}>Κλείσιμο Ημερών</h2>
        </div>
        <p className="text-xs" style={{ color: "#9CA3AF" }}>
          Κλίκ σε ημερομηνία για εναλλαγή — οι κλειστές μέρες δεν δέχονται κρατήσεις
        </p>
      </div>

      <div className="p-5">
        {/* Excursion selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6B7A8D" }}>Εκδρομή</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{
              width: "100%", padding: "7px 10px",
              border: "1px solid #E8ECF0", borderRadius: 8,
              fontSize: 13, color: "#1B3A5C", background: "#FAFBFC", outline: "none",
            }}
          >
            {excursions.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prev}
            type="button"
            style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #E8ECF0", background: "white", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <ChevronLeft style={{ width: 14, height: 14, color: "#6B7A8D" }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1B3A5C" }}>
            {MONTHS_EL[month]} {year}
          </span>
          <button
            onClick={next}
            type="button"
            style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #E8ECF0", background: "white", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <ChevronRight style={{ width: 14, height: 14, color: "#6B7A8D" }} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_SHORT.map(d => (
            <div
              key={d}
              style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: "#9CA3AF", padding: "2px 0" }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5" style={{ opacity: pending ? 0.65 : 1, transition: "opacity 0.15s" }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} style={{ aspectRatio: "1", minHeight: 30 }} />;

            const dateStr    = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isBlackout = blackoutSet.has(dateStr);
            const isToday    = dateStr === today;
            const isPast     = dateStr < today;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => !isPast && toggleDate(dateStr)}
                disabled={pending || isPast}
                title={isPast ? undefined : isBlackout ? "Κλίκ για άνοιγμα" : "Κλίκ για κλείσιμο"}
                style={{
                  aspectRatio: "1",
                  minHeight: 30,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  border: "none",
                  cursor: isPast ? "default" : "pointer",
                  background: isBlackout ? "#FEE2E2" : isToday ? "#DBEAFE" : "transparent",
                  transition: "background 0.1s",
                  gap: 1,
                  outline: "none",
                }}
              >
                <span style={{
                  fontSize: 12,
                  fontWeight: isBlackout || isToday ? 700 : 400,
                  color: isBlackout ? "#D94040" : isToday ? "#1D4ED8" : isPast ? "#D1D5DB" : "#374151",
                  lineHeight: 1,
                }}>
                  {day}
                </span>
                {isBlackout && (
                  <span style={{ fontSize: 8, color: "#D94040", fontWeight: 700, lineHeight: 1 }}>✕</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3" style={{ fontSize: 11, color: "#9CA3AF" }}>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "#FEE2E2", border: "1px solid #FECACA" }} />
            Κλειστό
          </div>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "#DBEAFE" }} />
            Σήμερα
          </div>
        </div>

        {/* Upcoming blackout list */}
        {upcomingBlackouts.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid #F0F2F5" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "#6B7A8D" }}>
              Επερχόμενα κλεισίματα ({upcomingBlackouts.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {upcomingBlackouts.map(b => (
                <div key={b.date} className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: "#1B3A5C" }}>{fmtDate(b.date)}</span>
                  <button
                    type="button"
                    onClick={() => toggleDate(b.date)}
                    disabled={pending}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "3px 9px", borderRadius: 6, border: "none",
                      background: "#FEE2E2", color: "#991B1B",
                      fontSize: 11, fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    <Trash2 style={{ width: 10, height: 10 }} />
                    Αφαίρεση
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingBlackouts.length === 0 && selectedId && (
          <p className="mt-4 text-xs" style={{ color: "#9CA3AF" }}>
            Δεν υπάρχουν κλειστές ημέρες για αυτή την εκδρομή.
          </p>
        )}
      </div>
    </div>
  );
}
