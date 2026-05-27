"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerPartner } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Info } from "lucide-react";

const AREAS = [
  { value: "heraklion", label: "Ηράκλειο" },
  { value: "chania",    label: "Χανιά" },
  { value: "rethymno",  label: "Ρέθυμνο" },
  { value: "lasithi",   label: "Λασίθι" },
];

export default function RegisterPartnerPage() {
  const [state, action, pending] = useActionState(registerPartner, { error: null });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold text-navy">
            Cretan<span className="text-gold">Desk</span>
          </Link>
          <Link href="/register" className="text-sm text-muted hover:text-navy transition-colors">
            ← Πίσω
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
            <div className="mb-7">
              <h1 className="font-display text-2xl font-bold text-navy mb-1">
                Εγγραφή Παρόχου Εμπειριών
              </h1>
              <p className="text-muted text-sm">
                Συμπλήρωσε τα στοιχεία της επιχείρησής σου
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 mb-6 text-sm text-blue-700">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              Ο λογαριασμός σου θα ενεργοποιηθεί μετά την έγκριση από τον διαχειριστή.
            </div>

            {state.error && (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 mb-6 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {state.error}
              </div>
            )}

            <form action={action} className="space-y-5">
              <fieldset className="space-y-4">
                <legend className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Στοιχεία Λογαριασμού
                </legend>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email <span className="text-danger">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="info@partner.gr"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">
                    Κωδικός πρόσβασης <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Τουλάχιστον 8 χαρακτήρες"
                    required
                    autoComplete="new-password"
                    minLength={8}
                  />
                </div>
              </fieldset>

              <hr className="border-border" />

              <fieldset className="space-y-4">
                <legend className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Στοιχεία Επιχείρησης
                </legend>

                <div className="space-y-1.5">
                  <Label htmlFor="business_name">
                    Επωνυμία <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    placeholder="π.χ. Cretan Sea Adventures"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="afm">ΑΦΜ</Label>
                    <Input id="afm" name="afm" placeholder="123456789" maxLength={9} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Τηλέφωνο</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+30 2810 000000" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Περιγραφή επιχείρησης</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Πείτε μας λίγα λόγια για την επιχείρησή σας και τις εμπειρίες που προσφέρετε…"
                    rows={4}
                  />
                </div>

                {/* Areas */}
                <div className="space-y-2">
                  <Label>Περιοχές δραστηριότητας</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AREAS.map(({ value, label }) => (
                      <label
                        key={value}
                        className="flex items-center gap-2.5 rounded-lg border border-border bg-background p-3 cursor-pointer hover:border-navy/30 has-[:checked]:border-navy has-[:checked]:bg-navy/5 transition-all"
                      >
                        <input
                          type="checkbox"
                          name="areas"
                          value={value}
                          className="h-4 w-4 rounded border-border text-navy accent-navy"
                        />
                        <span className="text-sm font-medium text-navy">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>

              <Button type="submit" variant="gold" className="w-full" disabled={pending}>
                {pending ? "Αποστολή…" : "Δημιουργία Λογαριασμού"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              Έχεις ήδη λογαριασμό;{" "}
              <Link href="/login" className="text-navy font-medium hover:text-gold transition-colors">
                Σύνδεση
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
