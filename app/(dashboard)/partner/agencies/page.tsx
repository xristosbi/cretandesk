import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Building2, Phone, MapPin, FileText, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddConnectionButton, RemoveConnectionButton } from "./ConnectionButtons";

type Agency = {
  id: string;
  business_name: string;
  afm: string | null;
  gemi: string | null;
  eot: string | null;
  phone: string | null;
  address: string | null;
};

export default async function PartnerAgenciesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Partner's current connections — RLS allows this (partner_id = auth.uid())
  const { data: connRows } = await supabase
    .from("partner_agency_connections")
    .select("agency_id")
    .eq("partner_id", user.id);

  const connectedIds = new Set((connRows ?? []).map((r) => r.agency_id));

  // All approved agencies — service client because RLS only exposes connected ones
  const service = createServiceClient();
  const { data: allAgencies } = await service
    .from("agencies")
    .select("id, business_name, afm, gemi, eot, phone, address")
    .eq("approved", true)
    .order("business_name");

  const agencies  = (allAgencies ?? []) as Agency[];
  const connected = agencies.filter((a) =>  connectedIds.has(a.id));
  const available = agencies.filter((a) => !connectedIds.has(a.id));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Γραφεία που Συνεργάζομαι</h1>
        <p className="text-muted text-sm mt-1">
          {connected.length} συνεργαζόμενα · {available.length} διαθέσιμα
        </p>
      </div>

      {/* ── Connected ── */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-navy uppercase tracking-wider">Ενεργές Συνεργασίες</h2>
          <Badge variant="outline" className="text-success border-success/40 bg-success/5">{connected.length}</Badge>
        </div>

        {connected.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center text-muted text-sm">
            Δεν έχετε προσθέσει κανένα γραφείο ακόμα.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connected.map((agency) => (
              <AgencyCard key={agency.id} agency={agency} connected
                action={<RemoveConnectionButton agencyId={agency.id} />}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Available ── */}
      {available.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Διαθέσιμα Γραφεία</h2>
            <Badge variant="outline">{available.length}</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map((agency) => (
              <AgencyCard key={agency.id} agency={agency}
                action={<AddConnectionButton agencyId={agency.id} />}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AgencyCard({
  agency,
  action,
  connected = false,
}: {
  agency: Agency;
  action: React.ReactNode;
  connected?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-xl shadow-sm p-5 flex flex-col gap-3 ${
      connected ? "border-success/30" : "border-border"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
          connected ? "bg-success/10" : "bg-navy/10"
        }`}>
          <Building2 className={`h-5 w-5 ${connected ? "text-success" : "text-navy"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-navy leading-tight">{agency.business_name}</p>
          {connected && (
            <span className="inline-block text-xs text-success font-medium mt-0.5">Ενεργή σύνδεση</span>
          )}
        </div>
      </div>

      {/* Details */}
      <dl className="space-y-1.5 text-sm">
        {agency.phone && (
          <div className="flex items-center gap-2 text-muted">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{agency.phone}</span>
          </div>
        )}
        {agency.address && (
          <div className="flex items-center gap-2 text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{agency.address}</span>
          </div>
        )}
        {agency.afm && (
          <div className="flex items-center gap-2 text-muted">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span>ΑΦΜ: {agency.afm}</span>
          </div>
        )}
      </dl>

      {/* Licenses */}
      {(agency.gemi || agency.eot) && (
        <div className="flex flex-wrap gap-1.5">
          {agency.gemi && (
            <Badge variant="outline" className="text-xs gap-1">
              <Award className="h-3 w-3" />ΓΕΜΗ {agency.gemi}
            </Badge>
          )}
          {agency.eot && (
            <Badge variant="outline" className="text-xs gap-1">
              <Award className="h-3 w-3" />ΕΟΤ {agency.eot}
            </Badge>
          )}
        </div>
      )}

      <div className="pt-1">{action}</div>
    </div>
  );
}
