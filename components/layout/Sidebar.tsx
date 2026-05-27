"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Building2,
  CreditCard,
  UserCircle,
  Compass,
  Handshake,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import type { UserRole } from "@/types/database";
import { logout } from "@/lib/actions/auth";

interface SidebarProps {
  role: UserRole;
  userEmail: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const partnerNav: NavItem[] = [
  { href: "/partner",           label: "Επισκόπηση",  icon: LayoutDashboard },
  { href: "/partner/excursions", label: "Εκδρομές",   icon: Map },
  { href: "/partner/bookings",  label: "Κρατήσεις",   icon: CalendarCheck },
  { href: "/partner/agencies",  label: "Γραφεία",     icon: Building2 },
  { href: "/partner/payments",  label: "Πληρωμές",    icon: CreditCard },
  { href: "/partner/profile",   label: "Προφίλ",      icon: UserCircle },
];

const agencyNav: NavItem[] = [
  { href: "/agency",            label: "Επισκόπηση",     icon: LayoutDashboard },
  { href: "/agency/excursions", label: "Εκδρομές",       icon: Compass },
  { href: "/agency/bookings",   label: "Κρατήσεις μου",  icon: CalendarCheck },
  { href: "/agency/partners",   label: "Συνεργάτες",     icon: Handshake },
  { href: "/agency/profile",    label: "Προφίλ",         icon: UserCircle },
];

const adminNav: NavItem[] = [
  { href: "/admin",            label: "Πίνακας Ελέγχου", icon: LayoutDashboard },
  { href: "/admin/users",      label: "Χρήστες",         icon: Users },
  { href: "/admin/analytics",  label: "Αναλυτικά",       icon: BarChart3 },
  { href: "/admin/payments",   label: "Πληρωμές",        icon: CreditCard },
];

const navByRole: Record<UserRole, NavItem[]> = {
  partner: partnerNav,
  agency:  agencyNav,
  admin:   adminNav,
};

export default function Sidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navByRole[role];

  function isActive(href: string) {
    if (href === "/partner" || href === "/agency" || href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-navy text-white">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <span className="font-display text-xl font-bold tracking-tight">
          Cretan<span className="text-gold">Desk</span>
        </span>
        <p className="text-xs text-white/50 mt-0.5">Crete&apos;s Experience Marketplace</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} className={active ? "text-gold" : "text-white/60"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-white/10 space-y-3">
        <div className="px-2">
          <p className="text-xs text-white/40 truncate">{userEmail}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} className="text-white/60" />
            Αποσύνδεση
          </button>
        </form>
      </div>
    </aside>
  );
}
