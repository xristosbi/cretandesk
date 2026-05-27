import { createClient } from "@/lib/supabase/server";
import { approveUser, suspendUser } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { UserRole, UserStatus } from "@/types/database";

const roleLabels: Record<string, string>   = { partner: "Πάροχος", agency: "Γραφείο", admin: "Admin" };
const statusLabels: Record<string, string> = { pending: "Εκκρεμεί", approved: "Εγκεκριμένο", suspended: "Ανασταλμένο" };
const statusVariants: Record<string, "pending" | "accepted" | "rejected" | "muted"> = {
  pending: "pending", approved: "accepted", suspended: "rejected",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, role, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Χρήστες</h1>
        <p className="text-muted text-sm mt-1">{users?.length ?? 0} χρήστες συνολικά</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {!users?.length ? (
          <div className="py-16 text-center text-muted">Δεν υπάρχουν χρήστες.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  {["Email", "Ρόλος", "Κατάσταση", "Εγγραφή", "Ενέργειες"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-muted font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-background/50">
                    <td className="px-5 py-4 font-medium text-navy">{u.email ?? "—"}</td>
                    <td className="px-5 py-4">
                      {u.role ? (
                        <Badge variant={u.role === "admin" ? "default" : u.role === "partner" ? "gold" : "outline"}>
                          {roleLabels[u.role]}
                        </Badge>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariants[u.status] ?? "muted"}>
                        {statusLabels[u.status] ?? u.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-muted whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {u.status === "pending" && u.role && u.role !== "admin" && (
                          <form action={approveUser.bind(null, u.id, u.role as UserRole)}>
                            <Button type="submit" size="sm" className="text-xs">Έγκριση</Button>
                          </form>
                        )}
                        {u.status !== "suspended" && u.role !== "admin" && (
                          <form action={suspendUser.bind(null, u.id)}>
                            <Button type="submit" size="sm" variant="destructive" className="text-xs">Αναστολή</Button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
