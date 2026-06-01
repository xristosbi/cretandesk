"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { addConnection, removeConnection } from "@/lib/actions/connections";
import { UserPlus, UserMinus } from "lucide-react";

export function AddConnectionButton({ agencyId }: { agencyId: string }) {
  const [, action, pending] = useActionState(addConnection, { error: null });
  return (
    <form action={action}>
      <input type="hidden" name="agencyId" value={agencyId} />
      <Button type="submit" size="sm" disabled={pending}>
        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
        {pending ? "…" : "Προσθήκη"}
      </Button>
    </form>
  );
}

export function RemoveConnectionButton({ agencyId }: { agencyId: string }) {
  const [, action, pending] = useActionState(removeConnection, { error: null });
  return (
    <form action={action}>
      <input type="hidden" name="agencyId" value={agencyId} />
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={pending}
        className="text-danger border-danger/40 hover:bg-danger/5 hover:border-danger"
      >
        <UserMinus className="h-3.5 w-3.5 mr-1.5" />
        {pending ? "…" : "Αφαίρεση"}
      </Button>
    </form>
  );
}
