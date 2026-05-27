"use client";

import { useEffect, useState, useActionState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updatePartnerProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { PREFECTURES } from "@/lib/constants/areas";

type Partner = { business_name: string; afm: string | null; phone: string | null; description: string | null; areas: string[] | null };

export default function PartnerProfilePage() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [state, action, pending] = useActionState(updatePartnerProfile, { error: null });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("partners").select("business_name, afm, phone, description, areas").eq("id", user.id).single()
        .then(({ data }) => setPartner(data));
    });
  }, []);

  if (!partner) return <div className="p-8 text-muted">Φόρτωση…</div>;

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Προφίλ Επιχείρησης</h1>
        <p className="text-muted text-sm mt-1">Ενημέρωσε τα στοιχεία σου</p>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{state.error}
        </div>
      )}
      {!state?.error && state !== null && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />Αποθηκεύτηκε!
        </div>
      )}

      <form action={action} className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="business_name">Επωνυμία <span className="text-danger">*</span></Label>
          <Input id="business_name" name="business_name" defaultValue={partner.business_name} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="afm">ΑΦΜ</Label>
            <Input id="afm" name="afm" defaultValue={partner.afm ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Τηλέφωνο</Label>
            <Input id="phone" name="phone" defaultValue={partner.phone ?? ""} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Περιγραφή</Label>
          <Textarea id="description" name="description" rows={4} defaultValue={partner.description ?? ""} />
        </div>
        <div className="space-y-3">
          <Label>Περιοχές δραστηριότητας</Label>
          {PREFECTURES.map((pref) => (
            <div key={pref.value}>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">{pref.label}</p>
              <div className="grid grid-cols-2 gap-2">
                {pref.towns.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 cursor-pointer hover:border-navy/30 has-[:checked]:border-navy has-[:checked]:bg-navy/5 transition-all">
                    <input type="checkbox" name="areas" value={value} defaultChecked={partner.areas?.includes(value)} className="accent-navy" />
                    <span className="text-sm text-navy">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Αποθήκευση…" : "Αποθήκευση αλλαγών"}
        </Button>
      </form>
    </div>
  );
}
