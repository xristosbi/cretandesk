import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { AgencyPartnersClient } from "./AgencyPartnersClient";

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

  const { data: connRows } = await supabase
    .from("partner_agency_connections")
    .select("partner_id")
    .eq("agency_id", user.id);

  const connectedIds = (connRows ?? []).map(r => r.partner_id);

  const service = createServiceClient();
  const { data: allPartners } = await service
    .from("partners")
    .select("id, business_name, afm, phone, description, areas")
    .eq("approved", true)
    .order("business_name");

  const partners = (allPartners ?? []) as Partner[];

  // Excursion counts + categories per partner
  const excursionCounts: Record<string, number> = {};
  const partnerCategories: Record<string, string[]> = {};

  if (partners.length > 0) {
    const { data: exRows } = await service
      .from("excursions")
      .select("partner_id, category")
      .in("partner_id", partners.map(p => p.id))
      .eq("active", true);

    (exRows ?? []).forEach(r => {
      excursionCounts[r.partner_id] = (excursionCounts[r.partner_id] ?? 0) + 1;
      if (r.category) {
        const cats = partnerCategories[r.partner_id] ?? [];
        if (!cats.includes(r.category)) cats.push(r.category);
        partnerCategories[r.partner_id] = cats;
      }
    });
  }

  return (
    <AgencyPartnersClient
      partners={partners}
      connectedIds={connectedIds}
      excursionCounts={excursionCounts}
      partnerCategories={partnerCategories}
    />
  );
}
