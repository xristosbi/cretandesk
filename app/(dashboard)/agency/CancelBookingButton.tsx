"use client";

import { useActionState } from "react";
import { cancelBooking } from "@/lib/actions/bookings";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [, action, pending] = useActionState(cancelBooking, { error: null });
  return (
    <form action={action}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <button
        type="submit"
        disabled={pending}
        style={{
          padding: "4px 10px",
          borderRadius: "6px",
          background: "#FEE2E2",
          color: "#991B1B",
          fontSize: "12px",
          fontWeight: 500,
          border: "none",
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.6 : 1,
          whiteSpace: "nowrap",
        }}
      >
        {pending ? "…" : "Ακύρωση"}
      </button>
    </form>
  );
}
