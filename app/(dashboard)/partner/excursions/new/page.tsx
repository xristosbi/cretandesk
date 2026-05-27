"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createExcursion } from "@/lib/actions/excursions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NewExcursionPage() {
  const [state, action, pending] = useActionState(createExcursion, { error: null });

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/partner/excursions">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Νέα Εκδρομή</h1>
          <p className="text-muted text-sm mt-0.5">Συμπλήρωσε τα στοιχεία της εκδρομής</p>
        </div>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{state.error}
        </div>
      )}

      <form action={action} className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Όνομα εκδρομής <span className="text-danger">*</span></Label>
          <Input id="name" name="name" placeholder="π.χ. Θαλάσσια περιήγηση Χανίων" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Περιγραφή</Label>
          <Textarea id="description" name="description" rows={4} placeholder="Περιγράψτε την εκδρομή…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Κατηγορία</Label>
            <select name="category" className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
              <option value="">Επιλογή…</option>
              <option value="sea">Θαλάσσια</option>
              <option value="adventure">Περιπέτεια</option>
              <option value="aerial">Εναέρια</option>
              <option value="gastronomy">Γαστρονομία</option>
              <option value="culture">Πολιτισμός</option>
              <option value="vip">VIP</option>
              <option value="niche">Ειδικές</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Περιοχή</Label>
            <select name="area" className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
              <option value="">Επιλογή…</option>
              <option value="heraklion">Ηράκλειο</option>
              <option value="chania">Χανιά</option>
              <option value="rethymno">Ρέθυμνο</option>
              <option value="lasithi">Λασίθι</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price_per_person">Τιμή/άτομο (€)</Label>
            <Input id="price_per_person" name="price_per_person" type="number" min="0" step="0.01" placeholder="25.00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="max_capacity">Μέγιστη χωρητικότητα</Label>
            <Input id="max_capacity" name="max_capacity" type="number" min="1" placeholder="20" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="duration_hours">Διάρκεια (ώρες)</Label>
            <Input id="duration_hours" name="duration_hours" type="number" min="0.5" step="0.5" placeholder="4" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="photos">URLs φωτογραφιών</Label>
          <Textarea id="photos" name="photos" rows={3} placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"} />
          <p className="text-xs text-muted">Μία URL ανά γραμμή</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "Αποθήκευση…" : "Δημιουργία Εκδρομής"}
          </Button>
          <Link href="/partner/excursions"><Button type="button" variant="outline">Ακύρωση</Button></Link>
        </div>
      </form>
    </div>
  );
}
