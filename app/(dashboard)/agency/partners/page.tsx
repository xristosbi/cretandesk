import { createClient } from "@/lib/supabase/server";
import { MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const areaLabels: Record<string, string> = {
  heraklion: "Ηράκλειο", chania: "Χανιά", rethymno: "Ρέθυμνο", lasithi: "Λασίθι",
};

export default async function AgencyPartnersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: connections } = await supabase
    .from("partner_agency_connections")
    .select(`partner_id, partners(business_name, phone, description, areas)`)
    .eq("agency_id", user.id)
    .eq("status", "approved");

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Συνεργάτες</h1>
        <p className="text-muted text-sm mt-1">{connections?.length ?? 0} πάροχοι</p>
      </div>

      {!connections?.length ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center text-muted">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          Δεν υπάρχουν συνδεδεμένοι πάροχοι ακόμα.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((c) => {
            const p = c.partners as { business_name: string; phone: string | null; description: string | null; areas: string[] | null } | null;
            return (
              <div key={c.partner_id} className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-gold" />
                  </div>
                  <p className="font-semibold text-navy">{p?.business_name ?? "—"}</p>
                </div>
                {p?.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Phone className="h-3.5 w-3.5" />{p.phone}
                  </div>
                )}
                {p?.description && <p className="text-xs text-muted line-clamp-2">{p.description}</p>}
                {p?.areas?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {p.areas.map(a => <Badge key={a} variant="outline">{areaLabels[a] ?? a}</Badge>)}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
