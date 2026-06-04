import { createClient } from "@/lib/supabase/server";
import { ExcursionsList } from "./ExcursionsList";

export default async function PartnerExcursionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: excursions } = await supabase
    .from("excursions")
    .select("*")
    .eq("partner_id", user.id)
    .order("created_at", { ascending: false });

  return <ExcursionsList excursions={excursions ?? []} />;
}
