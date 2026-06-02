import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import { InvoiceActions } from "./InvoiceActions";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data: fees } = await supabase
    .from("service_fees")
    .select(`*, partners(business_name)`)
    .order("created_at", { ascending: false });

  const totalOwed = fees?.filter(f => !f.paid).reduce((s, f) => s + (f.amount ?? 0), 0) ?? 0;
  const totalPaid = fees?.filter(f => f.paid).reduce((s, f) => s + (f.amount ?? 0), 0) ?? 0;
  const totalRevenue = (totalOwed + totalPaid);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Πληρωμές</h1>
        <p className="text-muted text-sm mt-1">Χρεώσεις υπηρεσίας όλων των παρόχων</p>
      </div>

      <InvoiceActions />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted uppercase font-semibold tracking-wider mb-2">Συνολικά έσοδα</p>
          <p className="font-display text-3xl font-bold text-navy">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted uppercase font-semibold tracking-wider mb-2">Εκκρεμεί πληρωμή</p>
          <p className="font-display text-3xl font-bold text-danger">{formatCurrency(totalOwed)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted uppercase font-semibold tracking-wider mb-2">Πληρωμένα</p>
          <p className="font-display text-3xl font-bold text-success">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-navy">Όλες οι χρεώσεις</h2>
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
                  {["Πάροχος", "Περίοδος", "Άτομα", "Ποσό", "Κατάσταση", "Stripe Invoice", "Ημ/νία"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-muted font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => {
                  const partner = f.partners as { business_name: string } | null;
                  return (
                    <tr key={f.id} className="border-b border-border last:border-0 hover:bg-background/50">
                      <td className="px-5 py-4 font-medium text-navy">{partner?.business_name ?? "—"}</td>
                      <td className="px-5 py-4 text-muted">{f.period ?? "—"}</td>
                      <td className="px-5 py-4 text-muted">{f.persons ?? "—"}</td>
                      <td className="px-5 py-4 font-semibold text-navy">{f.amount != null ? formatCurrency(f.amount) : "—"}</td>
                      <td className="px-5 py-4">
                        <Badge variant={f.paid ? "accepted" : "pending"}>{f.paid ? "Πληρώθηκε" : "Εκκρεμεί"}</Badge>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">
                        {f.stripe_invoice_id
                          ? <a href={`https://dashboard.stripe.com/invoices/${f.stripe_invoice_id}`}
                               target="_blank" rel="noreferrer"
                               className="text-navy underline underline-offset-2 hover:text-gold transition-colors">
                              {f.stripe_invoice_id.slice(0, 14)}…
                            </a>
                          : <span className="text-muted">—</span>
                        }
                      </td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">{formatDate(f.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
