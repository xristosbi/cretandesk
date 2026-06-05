"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_SHORT = ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σά", "Κυ"];
const MONTHS_EL = [
  "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος",
  "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος",
  "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος",
];

type Props = { bookedDates: string[] };

export function PartnerCalendar({ bookedDates }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const today = now.toISOString().slice(0, 10);
  const bookedSet = new Set(bookedDates);

  const firstDow = new Date(year, month, 1).getDay();
  const startOffset = (firstDow + 6) % 7; // shift to Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prev}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Προηγούμενος μήνας"
        >
          <ChevronLeft className="h-4 w-4" style={{ color: "#6B7A8D" }} />
        </button>
        <span className="text-sm font-semibold" style={{ color: "#1B3A5C" }}>
          {MONTHS_EL[month]} {year}
        </span>
        <button
          onClick={next}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Επόμενος μήνας"
        >
          <ChevronRight className="h-4 w-4" style={{ color: "#6B7A8D" }} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center py-1" style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells — dot style for booked dates */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} style={{ aspectRatio: "1", minHeight: 32 }} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === today;
          const isBooked = bookedSet.has(dateStr);

          return (
            <div
              key={dateStr}
              style={{
                aspectRatio: "1",
                minHeight: 32,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                borderRadius: "8px",
                background: isToday ? "#DBEAFE" : "transparent",
              }}
            >
              <span style={{
                fontSize: "13px",
                fontWeight: isToday ? 700 : 400,
                color: isToday ? "#1D4ED8" : "#374151",
                lineHeight: 1,
              }}>
                {day}
              </span>
              {/* Dot indicator */}
              <div style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: isBooked ? (isToday ? "#1D4ED8" : "#2563EB") : "transparent",
              }} />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-5" style={{ fontSize: "11px", color: "#9CA3AF" }}>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB" }} />
          Κράτηση
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 10, height: 10, borderRadius: 3, background: "#DBEAFE" }} />
          Σήμερα
        </div>
      </div>
    </div>
  );
}
