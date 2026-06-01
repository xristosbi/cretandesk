"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addConnection, removeConnection } from "@/lib/actions/connections";
import { UserPlus, UserMinus } from "lucide-react";

export function AddConnectionButton({ agencyId }: { agencyId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() => start(() => addConnection(agencyId))}
    >
      <UserPlus className="h-3.5 w-3.5 mr-1.5" />
      {pending ? "…" : "Προσθήκη"}
    </Button>
  );
}

export function RemoveConnectionButton({ agencyId }: { agencyId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      className="text-danger border-danger/40 hover:bg-danger/5 hover:border-danger"
      onClick={() => start(() => removeConnection(agencyId))}
    >
      <UserMinus className="h-3.5 w-3.5 mr-1.5" />
      {pending ? "…" : "Αφαίρεση"}
    </Button>
  );
}
