import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { MapPin, Phone, Lock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAreaLabel } from "@/lib/constants/areas";

type Partner = {
  id: string;
  business_name: string;
  afm: string | null;
  phone: string | null;
  description: string | null;
  areas: string[] | null;
};

export default async function AgencyPartnersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Agency's current connections — RLS allows this (agency_id = auth.uid())
  const { data: connRows } = await supabase
    .from("partner_agency_connections")
    .select("partner_id")
    .eq("agency_id", user.id);

  const connectedIds = new Set((connRows ?? []).map((r) => r.partner_id));

  // All approved partners — service client because RLS only exposes connected ones
  const service = createServiceClient();
  const { data: allPartners } = await service
    .from("partners")
    .select("id, business_name, afm, phone, description, areas")
    .eq("approved", true)
    .order("business_name");

  const partners    = (allPartners ?? []) as Partner[];
  const connected   = partners.filter((p) =>  connectedIds.has(p.id));
  const unconnected = partners.filter((p) => !connectedIds.has(p.id));

  // Active excursion counts for connected partners (one query, joined in memory)
  const excursionCounts: Record<string, number> = {};
  if (connected.length > 0) {
    const { data: exRows } = await service
      .from("excursions")
      .select("partner_id")
      .in("partner_id", connected.map((p) => p.id))
      .eq("active", true);

    (exRows ?? []).forEach((r) => {
      excursionCounts[r.partner_id] = (excursionCounts[r.partner_id] ?? 0) + 1;
    });
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Συνεργάτες</h1>
        <p className="text-muted text-sm mt-1">
          {connected.length} ενεργές συνεργασίες · {unconnected.length} άλλοι πάροχοι
        </p>
      </div>

      {/* ── Connected partners ── */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wider">Ενεργές Συνεργασίες</h2>
          <Badge variant="outline" className="text-success border-success/40 bg-success/5">{connected.length}</Badge>
        </div>

        {connected.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center text-muted text-sm">
            Δεν υπάρχουν ενεργές συνεργασίες ακόμα. Επικοινωνήστε με τους παρόχους που σας ενδιαφέρουν.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connected.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} connected
                excursionCount={excursionCounts[partner.id] ?? 0}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Discoverable partners ── */}
      {unconnected.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Άλλοι Πάροχοι</h2>
            <Badge variant="outline">{unconnected.length}</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unconnected.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PartnerCard({
  partner,
  excursionCount,
  connected = false,
}: {
  partner: Partner;
  excursionCount?: number;
  connected?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-xl shadow-sm p-5 flex flex-col gap-3 ${
      connected ? "border-success/30" : "border-border opacity-75"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
          connected ? "bg-gold/10" : "bg-muted/10"
        }`}>
          <MapPin className={`h-5 w-5 ${connected ? "text-gold" : "text-muted"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-navy leading-tight">{partner.business_name}</p>
          {connected && excursionCount !== undefined && (
            <p className="text-xs text-muted mt-0.5">{excursionCount} ενεργές εκδρομές</p>
          )}
        </div>
        {connected ? (
          <Badge className="shrink-0 bg-success/10 text-success border-success/30 text-xs">Συνεργάτης</Badge>
        ) : (
          <span className="shrink-0 flex items-center gap-1 text-xs text-muted">
            <Lock className="h-3 w-3" />Χωρίς σύνδεση
          </span>
        )}
      </div>

      {/* Contact & identity */}
      <dl className="space-y-1.5 text-sm">
        {partner.phone && (
          <div className="flex items-center gap-2 text-muted">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{partner.phone}</span>
          </div>
        )}
        {partner.afm && (
          <div className="flex items-center gap-2 text-muted">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span>ΑΦΜ: {partner.afm}</span>
          </div>
        )}
      </dl>

      {/* Description */}
      {partner.description && (
        <p className="text-xs text-muted line-clamp-3 leading-relaxed">{partner.description}</p>
      )}

      {/* Areas */}
      {partner.areas && partner.areas.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {partner.areas.map((a) => (
            <Badge key={a} variant="outline" className="text-xs">{getAreaLabel(a)}</Badge>
          ))}
        </div>
      )}

      {/* Not connected note */}
      {!connected && (
        <p className="text-xs text-muted bg-background rounded-lg px-3 py-2 leading-relaxed">
          Επικοινωνήστε με τον πάροχο για να σας προσθέσει ως συνεργαζόμενο γραφείο.
        </p>
      )}
    </div>
  );
}
