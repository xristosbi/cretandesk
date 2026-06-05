"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

// ── Colours ─────────────────────────────────────────────────────────────────
const CATEGORY_COLORS = [
  "#1B3A5C", // sea      — navy
  "#E8A020", // adventure — gold
  "#2D9B6F", // aerial    — green
  "#F59E0B", // gastronomy — amber
  "#8B5CF6", // culture   — purple
  "#EC4899", // vip       — pink
  "#6B7A8D", // niche     — muted
];

const MONTH_SHORT_EL = [
  "Ιαν","Φεβ","Μαρ","Απρ","Μάι","Ιούν",
  "Ιούλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ",
];

function monthLabel(ym: string): string {
  const [, m] = ym.split("-");
  return MONTH_SHORT_EL[parseInt(m, 10) - 1] ?? ym;
}

// ── Prop types ───────────────────────────────────────────────────────────────
export type CategoryCount  = { label: string; count: number };
export type MonthlyCount   = { month: string; count: number };
export type MonthlyRevenue = { month: string; revenue: number };

type Props = {
  categoryData:    CategoryCount[];
  monthlyBookings: MonthlyCount[];
  monthlyRevenue:  MonthlyRevenue[];
};

// ── Shared tooltip style ────────────────────────────────────────────────────
const tooltipDefaults = {
  backgroundColor: "rgba(27,58,92,0.92)",
  titleColor: "#fff",
  bodyColor: "#E8ECF0",
  padding: 10,
  cornerRadius: 8,
  displayColors: true,
};

// ── Donut: bookings by category ──────────────────────────────────────────────
function CategoryDonut({ data }: { data: CategoryCount[] }) {
  const nonEmpty = data.filter(d => d.count > 0);
  if (!nonEmpty.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, color: "#9CA3AF", fontSize: 13 }}>
        Δεν υπάρχουν δεδομένα.
      </div>
    );
  }

  const chartData = {
    labels: nonEmpty.map(d => d.label),
    datasets: [{
      data: nonEmpty.map(d => d.count),
      backgroundColor: CATEGORY_COLORS.slice(0, nonEmpty.length),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#6B7A8D",
          font: { size: 11, family: "DM Sans" },
          padding: 12,
          boxWidth: 10,
          boxHeight: 10,
        },
      },
      tooltip: { ...tooltipDefaults },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}

// ── Bar: monthly bookings ────────────────────────────────────────────────────
function MonthlyBookingsBar({ data }: { data: MonthlyCount[] }) {
  const chartData = {
    labels: data.map(d => monthLabel(d.month)),
    datasets: [{
      label: "Κρατήσεις",
      data: data.map(d => d.count),
      backgroundColor: "#1B3A5C",
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: "#2D5580",
    }],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipDefaults },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#9CA3AF", font: { size: 11, family: "DM Sans" } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#9CA3AF",
          font: { size: 11, family: "DM Sans" },
          stepSize: 1,
          precision: 0,
        },
        grid: { color: "#F0F2F5" },
        border: { display: false },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}

// ── Line: monthly revenue ────────────────────────────────────────────────────
function MonthlyRevenueLine({ data }: { data: MonthlyRevenue[] }) {
  const chartData = {
    labels: data.map(d => monthLabel(d.month)),
    datasets: [{
      label: "Έσοδα (€)",
      data: data.map(d => d.revenue),
      borderColor: "#E8A020",
      backgroundColor: "rgba(232,160,32,0.12)",
      borderWidth: 2.5,
      pointBackgroundColor: "#E8A020",
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.38,
      fill: true,
    }],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults,
        callbacks: {
          label: ctx => ` €${(ctx.parsed.y as number).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#9CA3AF", font: { size: 11, family: "DM Sans" } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#9CA3AF",
          font: { size: 11, family: "DM Sans" },
          callback: v => `€${v}`,
        },
        grid: { color: "#F0F2F5" },
        border: { display: false },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

// ── Main exported component ──────────────────────────────────────────────────
export function AnalyticsCharts({ categoryData, monthlyBookings, monthlyRevenue }: Props) {
  return (
    <div className="space-y-6">
      {/* Top row: donut + bar side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Donut */}
        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 className="font-semibold text-base mb-1" style={{ color: "#1B3A5C" }}>Κρατήσεις ανά κατηγορία</h3>
          <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>Κατανομή κρατήσεων ανά τύπο εκδρομής</p>
          <div style={{ maxWidth: 280, margin: "0 auto" }}>
            <CategoryDonut data={categoryData} />
          </div>
        </div>

        {/* Monthly bookings bar */}
        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 className="font-semibold text-base mb-1" style={{ color: "#1B3A5C" }}>Κρατήσεις ανά μήνα</h3>
          <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>Τελευταίοι 6 μήνες</p>
          <MonthlyBookingsBar data={monthlyBookings} />
        </div>
      </div>

      {/* Revenue line — full width */}
      <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E8ECF0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-base" style={{ color: "#1B3A5C" }}>Έσοδα πλατφόρμας</h3>
            <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Μηνιαία έσοδα από service fees (€0.50/άτομο)</p>
          </div>
          <span style={{
            fontSize: 13, fontWeight: 700, color: "#E8A020",
            background: "#FFFBEB", padding: "3px 10px", borderRadius: 20,
          }}>
            €{monthlyRevenue.reduce((s, m) => s + m.revenue, 0).toFixed(2)} σύνολο
          </span>
        </div>
        <MonthlyRevenueLine data={monthlyRevenue} />
      </div>
    </div>
  );
}
