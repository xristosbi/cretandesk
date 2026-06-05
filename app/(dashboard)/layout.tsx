import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { DashboardShell } from "./DashboardShell";
import type { UserRole } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  const profile = profileData as { role: string | null; status: string } | null;

  if (!profile) {
    redirect("/login");
  }

  if (profile.status === "pending") {
    redirect("/pending");
  }

  if (profile.status === "suspended") {
    redirect("/suspended");
  }

  const role = profile.role as UserRole;

  return (
    <DashboardShell
      sidebar={<Sidebar role={role} userEmail={user.email!} />}
      topBar={<NotificationBell userId={user.id} />}
    >
      {children}
    </DashboardShell>
  );
}
