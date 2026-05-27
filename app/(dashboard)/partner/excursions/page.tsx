import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleExcursionActive, deleteExcursion } from "@/lib/actions/excursions";
import { Plus, MapPin, Clock, Users, Image } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  sea: "Θαλάσσια", adventure: "Περιπέτεια", aerial: "Εναέρια",
  gastronomy: "Γαστρονομία", culture: "Πολιτισμός", vip: "VIP", niche: "Ειδικές",
};
const areaLabels: Record<string, string> = {
  heraklion: "Ηράκλειο", chania: "Χανιά", rethymno: "Ρέθυμνο", lasithi: "Λασίθι",
};

export default async function PartnerExcursionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: excursions } = await supabase
    .from("excursions")
    .select("*")
    .eq("partner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Εκδρομές</h1>
          <p className="text-muted text-sm mt-1">{excursions?.length ?? 0} εκδρομές</p>
        </div>
        <Link href="/partner/excursions/new">
          <Button><Plus className="h-4 w-4" /> Νέα Εκδρομή</Button>
        </Link>
      </div>

      {!excursions?.length ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center">
          <MapPin className="h-10 w-10 text-muted mx-auto mb-3" />
          <p className="text-navy font-medium mb-1">Δεν έχεις εκδρομές ακόμα</p>
          <p className="text-muted text-sm mb-4">Δημιούργησε την πρώτη σου εκδρομή</p>
          <Link href="/partner/excursions/new"><Button>Νέα Εκδρομή</Button></Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {excursions.map((ex) => (
            <div key={ex.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="h-36 bg-background flex items-center justify-center border-b border-border">
                {ex.photos?.[0] ? (
                  <img src={ex.photos[0]} alt={ex.name} className="w-full h-full object-cover" />
                ) : (
                  <Image className="h-10 w-10 text-muted" />
                )}
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-navy leading-tight">{ex.name}</h3>
                  <Badge variant={ex.active ? "accepted" : "muted"} className="shrink-0 text-xs">
                    {ex.active ? "Ενεργή" : "Ανενεργή"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ex.category && <Badge variant="outline">{categoryLabels[ex.category] ?? ex.category}</Badge>}
                  {ex.area && <Badge variant="outline">{areaLabels[ex.area] ?? ex.area}</Badge>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted">
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ex.price_per_person != null ? formatCurrency(ex.price_per_person) : "—"}</div>
                  <div className="flex items-center gap-1"><Users className="h-3 w-3" />{ex.max_capacity ?? "—"}</div>
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{ex.duration_hours != null ? `${ex.duration_hours}ω` : "—"}</div>
                </div>
                <div className="flex gap-2 pt-1">
                  <form action={toggleExcursionActive.bind(null, ex.id, !ex.active)} className="flex-1">
                    <Button type="submit" variant="outline" size="sm" className="w-full text-xs">
                      {ex.active ? "Απενεργοποίηση" : "Ενεργοποίηση"}
                    </Button>
                  </form>
                  <form action={deleteExcursion.bind(null, ex.id)}>
                    <Button type="submit" variant="destructive" size="sm" className="text-xs">Διαγραφή</Button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
