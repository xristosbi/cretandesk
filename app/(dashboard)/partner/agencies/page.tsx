import { createClient } from "@/lib/supabase/server";
import { Building2, Phone } from "lucide-react";

export default async function PartnerAgenciesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  type ConnectionRow = {
    agency_id: string;
    status: string;
    created_at: string;
    agencies: { business_name: string; afm: string | null; phone: string | null; address: string | null } | null;
  };

  const { data: rawConnections } = await supabase
    .from("partner_agency_connections")
    .select(`agency_id, status, created_at, agencies(business_name, afm, phone, address)`)
    .eq("partner_id", user.id)
    .eq("status", "approved");

  const connections = rawConnections as ConnectionRow[] | null;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy">Συνεργαζόμενα Γραφεία</h1>
        <p className="text-muted text-sm mt-1">{connections?.length ?? 0} γραφεία</p>
      </div>

      {!connections?.length ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center">
          <Building2 className="h-10 w-10 text-muted mx-auto mb-3" />
          <p className="text-navy font-medium">Δεν υπάρχουν συνδεδεμένα γραφεία ακόμα.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((c) => {
            const agency = c.agencies;
            return (
              <div key={c.agency_id} className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-navy" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy truncate">{agency?.business_name ?? "—"}</p>
                    {agency?.afm && <p className="text-xs text-muted">ΑΦΜ: {agency.afm}</p>}
                  </div>
                </div>
                {agency?.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Phone className="h-3.5 w-3.5" />{agency.phone}
                  </div>
                )}
                {agency?.address && <p className="text-xs text-muted">{agency.address}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
