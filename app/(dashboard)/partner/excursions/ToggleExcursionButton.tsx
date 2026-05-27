"use client";

import { Button } from "@/components/ui/button";
import { toggleExcursionActive } from "@/lib/actions/excursions";
import { useTransition } from "react";

interface ToggleExcursionButtonProps {
  id: string;
  active: boolean;
}

export default function ToggleExcursionButton({ id, active }: ToggleExcursionButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleExcursionActive(id, !active);
    });
  }

  return (
    <Button
      variant={active ? "outline" : "default"}
      size="sm"
      className="w-full"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? "..." : active ? "Απενεργοποίηση" : "Ενεργοποίηση"}
    </Button>
  );
}
