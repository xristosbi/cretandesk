import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CreditCard } from "lucide-react";

export default async function PartnerPaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: fees } = await supabase
    .from("service_fees")
    .select("*")
    .eq("partner_id", user.id)
    .order("created_at", { ascending: false });

  const totalOwed = fees?.filter(f => !f.paid).reduce((s, f) => s + (f.amount ?? 0), 0) ?? 0;
  const totalPaid = fees?.filter(f => f.paid).reduce((s, f) => s + (f.amount ?? 0), 0) ?? 0;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Πληρωμές</h1>
        <p className="text-muted text-sm mt-1">Χρεώσεις υπηρεσίας (0,50€/άτομο)</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted uppercase font-semibold tracking-wider mb-2">Εκκρεμεί πληρωμή</p>
          <p className="font-display text-3xl font-bold text-danger">{formatCurrency(totalOwed)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted uppercase font-semibold tracking-wider mb-2">Συνολικά πληρωμένα</p>
          <p className="font-display text-3xl font-bold text-success">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-navy">Ιστορικό χρεώσεων</h2>
        </div>
        {!fees?.length ? (
          <div className="py-16 text-center text-muted">
            <CreditCard className="h-8 w-8 mx-auto mb-2" />
            Δεν υπάρχουν χρεώσεις ακόμα.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  {["Περίοδος", "Κράτηση", "Άτομα", "Ποσό", "Κατάσταση", "Stripe Invoice"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-muted font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id} className="border-b border-border last:border-0 hover:bg-background/50">
                    <td className="px-5 py-4 font-medium text-navy">{f.period ?? "—"}</td>
                    <td className="px-5 py-4 text-muted font-mono text-xs">{f.booking_id.slice(0, 8)}…</td>
                    <td className="px-5 py-4 text-muted">{f.persons ?? "—"}</td>
                    <td className="px-5 py-4 font-semibold text-navy">{f.amount != null ? formatCurrency(f.amount) : "—"}</td>
                    <td className="px-5 py-4">
                      <Badge variant={f.paid ? "accepted" : "pending"}>{f.paid ? "Πληρώθηκε" : "Εκκρεμεί"}</Badge>
                    </td>
                    <td className="px-5 py-4 text-muted font-mono text-xs">{f.stripe_invoice_id ?? "—"}</td>
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
