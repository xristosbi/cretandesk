import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
  accent?: "navy" | "gold";
};

export function EmptyState({ icon: Icon, title, description, action, accent = "navy" }: Props) {
  const accentColor = accent === "gold" ? "#E8A020" : "#1B3A5C";
  const accentLight = accent === "gold" ? "#FEF3C7" : "#EEF2FF";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "56px 32px",
      textAlign: "center",
    }}>
      {/* Icon container */}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 20,
        background: accentLight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}>
        <Icon style={{ width: 32, height: 32, color: accentColor }} />
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1B3A5C", marginBottom: 8 }}>
        {title}
      </h3>
      <p style={{
        fontSize: 13,
        color: "#9CA3AF",
        maxWidth: 300,
        lineHeight: 1.6,
        marginBottom: action ? 24 : 0,
      }}>
        {description}
      </p>

      {action && (
        <Link href={action.href}>
          <button
            type="button"
            style={{
              padding: "9px 22px",
              borderRadius: 9,
              background: accentColor,
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            }}
          >
            {action.label}
          </button>
        </Link>
      )}
    </div>
  );
}
