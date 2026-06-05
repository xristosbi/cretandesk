"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export function DashboardShell({
  sidebar,
  topBar,
  children,
}: {
  sidebar: React.ReactNode;
  topBar?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="flex min-h-screen bg-background">

      {/* Dark backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: "rgba(0,0,0,0.48)" }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30
        transition-transform duration-250 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        {sidebar}
      </div>

      {/* Main content column */}
      <div className="flex flex-col flex-1 lg:ml-64 min-h-screen min-w-0 w-full">

        {/* Top bar — hamburger on mobile, bell always */}
        <header
          className="sticky top-0 z-10 flex items-center gap-3 px-4 shrink-0"
          style={{
            height: 56,
            background: "white",
            borderBottom: "1px solid #F0F2F5",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
            className="lg:hidden"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 8,
              border: "none", background: "transparent",
              cursor: "pointer", color: "#1B3A5C",
              flexShrink: 0,
            }}
          >
            {open
              ? <X style={{ width: 20, height: 20 }} />
              : <Menu style={{ width: 20, height: 20 }} />
            }
          </button>

          {/* Logo — mobile only (desktop has sidebar) */}
          <span className="lg:hidden font-display font-bold" style={{ fontSize: 18, color: "#1B3A5C" }}>
            Cretan<span style={{ color: "#E8A020" }}>Desk</span>
          </span>

          {/* Push right-side items to the end */}
          <div className="flex-1" />

          {/* Notification bell (+ any future right-side items) */}
          {topBar}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
