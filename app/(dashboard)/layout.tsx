import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
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
    <div className="flex min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar role={role} userEmail={user.email!} />
      </div>
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
