import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  change?: number; // percentage, positive or negative
  className?: string;
}

export default function StatsCard({ icon: Icon, value, label, change, className }: StatsCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl shadow-sm p-5", className)}>
      <div className="flex items-start justify-between">
        <div className="p-2 bg-background rounded-lg">
          <Icon size={20} className="text-navy" />
        </div>
        {change !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              change >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-navy">{value}</p>
        <p className="text-sm text-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}
