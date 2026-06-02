"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { acceptBooking, declineBooking, completeBooking } from "@/lib/actions/bookings";

export function BookingActions({ bookingId, status }: { bookingId: string; status: string }) {
  const [, acceptAction,   acceptPending]   = useActionState(acceptBooking,   { error: null });
  const [, declineAction,  declinePending]  = useActionState(declineBooking,  { error: null });
  const [, completeAction, completePending] = useActionState(completeBooking, { error: null });

  if (status === "pending") {
    return (
      <div className="flex gap-2">
        <form action={acceptAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <Button type="submit" size="sm" className="text-xs" disabled={acceptPending}>
            {acceptPending ? "…" : "Αποδοχή"}
          </Button>
        </form>
        <form action={declineAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <Button type="submit" size="sm" variant="destructive" className="text-xs" disabled={declinePending}>
            {declinePending ? "…" : "Απόρριψη"}
          </Button>
        </form>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <form action={completeAction}>
        <input type="hidden" name="bookingId" value={bookingId} />
        <Button type="submit" size="sm" variant="outline" className="text-xs" disabled={completePending}>
          {completePending ? "…" : "Ολοκλήρωση"}
        </Button>
      </form>
    );
  }

  return null;
}
