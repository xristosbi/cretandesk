"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import type { UserRole } from "@/types/database";

export async function approveUser(userId: string, role: UserRole) {
  const serviceClient = createServiceClient();

  // Update profile status
  const { error: profileError } = await serviceClient
    .from("profiles")
    .update({ status: "approved" })
    .eq("id", userId);

  if (profileError) throw new Error(profileError.message);

  // Update role-specific approved flag
  if (role === "partner") {
    const { error } = await serviceClient
      .from("partners")
      .update({ approved: true })
      .eq("id", userId);
    if (error) throw new Error(error.message);
  } else if (role === "agency") {
    const { error } = await serviceClient
      .from("agencies")
      .update({ approved: true })
      .eq("id", userId);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function suspendUser(userId: string) {
  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from("profiles")
    .update({ status: "suspended" })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}
