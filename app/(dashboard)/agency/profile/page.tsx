"use client";

import { useEffect, useState, useActionState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateAgencyProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type Agency = { business_name: string; afm: string | null; gemi: string | null; eot: string | null; phone: string | null; address: string | null };

export default function AgencyProfilePage() {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [state, action, pending] = useActionState(updateAgencyProfile, { error: null });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("agencies").select("business_name, afm, gemi, eot, phone, address").eq("id", user.id).single()
        .then(({ data }) => setAgency(data));
    });
  }, []);

  if (!agency) return <div className="p-8 text-muted">Φόρτωση…</div>;

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

      <form action={action} className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="business_name">Επωνυμία <span className="text-danger">*</span></Label>
          <Input id="business_name" name="business_name" defaultValue={agency.business_name} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="afm">ΑΦΜ</Label>
            <Input id="afm" name="afm" defaultValue={agency.afm ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Τηλέφωνο</Label>
            <Input id="phone" name="phone" defaultValue={agency.phone ?? ""} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="gemi">ΓΕΜΗ</Label>
            <Input id="gemi" name="gemi" defaultValue={agency.gemi ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eot">ΕΟΤ</Label>
            <Input id="eot" name="eot" defaultValue={agency.eot ?? ""} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Διεύθυνση</Label>
          <Input id="address" name="address" defaultValue={agency.address ?? ""} />
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Αποθήκευση…" : "Αποθήκευση αλλαγών"}
        </Button>
      </form>
    </div>
  );
}
