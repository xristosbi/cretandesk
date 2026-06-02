"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createMonthlyInvoices } from "@/lib/actions/invoicing";
import { Receipt, CheckCircle2, AlertCircle } from "lucide-react";

function defaultPeriod() {
  const d = new Date();
  // Default to previous month (most common use case at month-end)
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
}

export function InvoiceActions() {
  const [state, action, pending] = useActionState(createMonthlyInvoices, {
    error: null,
    summary: null,
  });

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-lg bg-navy/10 flex items-center justify-center">
          <Receipt className="h-5 w-5 text-navy" />
        </div>
        <div>
          <h2 className="font-semibold text-navy">Μηνιαία Εκκαθάριση</h2>
          <p className="text-xs text-muted mt-0.5">
            Δημιουργία Stripe Invoice για κάθε πάροχο με εκκρεμείς χρεώσεις
          </p>
        </div>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {state.error}
        </div>
      )}

      {state.summary && !state.error && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          {state.summary}
        </div>
      )}

      <form action={action} className="flex items-end gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="period"
            className="text-xs font-medium text-muted uppercase tracking-wider"
          >
            Περίοδος
          </label>
          <input
            id="period"
            name="period"
            type="month"
            defaultValue={defaultPeriod()}
            required
            className="flex h-10 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          />
        </div>
        <Button type="submit" disabled={pending}>
          <Receipt className="h-4 w-4 mr-2" />
          {pending ? "Δημιουργία…" : "Εκτέλεση Εκκαθάρισης"}
        </Button>
      </form>

      <p className="text-xs text-muted mt-3">
        Αυτή η ενέργεια θα δημιουργήσει Stripe Invoice για κάθε πάροχο και θα αποστείλει email με τον σύνδεσμο πληρωμής. Εκτελέστε μία φορά ανά περίοδο.
      </p>
    </div>
  );
}
