import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { AgenciesClient } from "./AgenciesClient";

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

  const { data: connRows } = await supabase
    .from("partner_agency_connections")
    .select("agency_id")
    .eq("partner_id", user.id);

  const connectedIds = (connRows ?? []).map(r => r.agency_id);

  const service = createServiceClient();
  const { data: allAgencies } = await service
    .from("agencies")
    .select("id, business_name, afm, gemi, eot, phone, address")
    .eq("approved", true)
    .order("business_name");

  return (
    <AgenciesClient
      agencies={(allAgencies ?? []) as Agency[]}
      connectedIds={connectedIds}
    />
  );
}
