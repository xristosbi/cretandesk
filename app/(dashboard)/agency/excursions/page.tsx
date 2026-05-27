"use client";

import { useEffect, useState, useActionState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createBooking } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Clock, Users, MapPin, AlertCircle, CheckCircle2, Image } from "lucide-react";

const categoryLabels: Record<string, string> = {
  sea: "Θαλάσσια", adventure: "Περιπέτεια", aerial: "Εναέρια",
  gastronomy: "Γαστρονομία", culture: "Πολιτισμός", vip: "VIP", niche: "Ειδικές",
};
const areaLabels: Record<string, string> = {
  heraklion: "Ηράκλειο", chania: "Χανιά", rethymno: "Ρέθυμνο", lasithi: "Λασίθι",
};

type Excursion = {
  id: string; name: string; description: string | null; category: string | null;
  area: string | null; price_per_person: number | null; max_capacity: number | null;
  duration_hours: number | null; photos: string[] | null; partner_id: string;
  partners: { business_name: string } | null;
};

export default function AgencyExcursionsPage() {
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [selected, setSelected] = useState<Excursion | null>(null);
  const [filterArea, setFilterArea] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [state, action, pending] = useActionState(createBooking, { error: null });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("partner_agency_connections")
        .select("partner_id")
        .eq("agency_id", user.id)
        .eq("status", "approved")
        .then(({ data: conns }) => {
          if (!conns?.length) return;
          const partnerIds = conns.map(c => c.partner_id);
          supabase.from("excursions")
            .select(`*, partners(business_name)`)
            .in("partner_id", partnerIds)
            .eq("active", true)
            .then(({ data }) => setExcursions((data as Excursion[]) ?? []));
        });
    });
  }, []);

  useEffect(() => {
    if (!state?.error && state !== null && pending === false && selected) {
      setSuccess(true);
      setTimeout(() => { setSelected(null); setSuccess(false); }, 2000);
    }
  }, [state, pending]);

  const filtered = excursions.filter(e =>
    (!filterArea || e.area === filterArea) &&
    (!filterCat  || e.category === filterCat)
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Εκδρομές</h1>
        <p className="text-muted text-sm mt-1">Αίτημα κράτησης εκδρομής</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterArea} onChange={e => setFilterArea(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-3 text-sm text-navy">
          <option value="">Όλες οι περιοχές</option>
          {Object.entries(areaLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-3 text-sm text-navy">
          <option value="">Όλες οι κατηγορίες</option>
          {Object.entries(categoryLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {(filterArea || filterCat) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterArea(""); setFilterCat(""); }}>Εκκαθάριση</Button>
        )}
      </div>

      {!filtered.length ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center text-muted">
          Δεν βρέθηκαν εκδρομές.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ex) => (
            <div key={ex.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="h-36 bg-background flex items-center justify-center border-b border-border">
                {ex.photos?.[0] ? (
                  <img src={ex.photos[0]} alt={ex.name} className="w-full h-full object-cover" />
                ) : <Image className="h-10 w-10 text-muted" />}
              </div>
              <div className="p-4 flex flex-col flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-navy">{ex.name}</h3>
                  <p className="text-xs text-muted mt-0.5">{(ex.partners as { business_name: string } | null)?.business_name ?? "—"}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ex.category && <Badge variant="outline">{categoryLabels[ex.category] ?? ex.category}</Badge>}
                  {ex.area && <Badge variant="outline">{areaLabels[ex.area] ?? ex.area}</Badge>}
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs text-muted">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ex.price_per_person != null ? formatCurrency(ex.price_per_person) : "—"}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{ex.max_capacity ?? "—"}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ex.duration_hours != null ? `${ex.duration_hours}ω` : "—"}</span>
                </div>
                <Button size="sm" className="mt-auto" onClick={() => setSelected(ex)}>Αίτημα Κράτησης</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Αίτημα Κράτησης</DialogTitle>
            <DialogDescription>{selected?.name}</DialogDescription>
          </DialogHeader>
          {success ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-4 py-3 text-sm">
              <CheckCircle2 className="h-4 w-4" />Το αίτημα υποβλήθηκε!
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <input type="hidden" name="excursion_id" value={selected?.id ?? ""} />
              <input type="hidden" name="partner_id"   value={selected?.partner_id ?? ""} />
              {state?.error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle className="h-4 w-4" />{state.error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="date">Ημερομηνία <span className="text-danger">*</span></Label>
                <Input id="date" name="date" type="date" required min={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="adults">Ενήλικες</Label>
                  <Input id="adults" name="persons_adults" type="number" min="0" defaultValue="1" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="children">Παιδιά</Label>
                  <Input id="children" name="persons_children" type="number" min="0" defaultValue="0" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Σημειώσεις</Label>
                <Input id="notes" name="notes" placeholder="Ειδικές απαιτήσεις…" />
              </div>
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Υποβολή…" : "Υποβολή Αιτήματος"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
