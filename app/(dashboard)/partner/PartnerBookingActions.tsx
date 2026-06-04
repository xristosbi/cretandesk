"use client";

import { useActionState } from "react";
import { acceptBooking, declineBooking, completeBooking } from "@/lib/actions/bookings";

const btn = (bg: string, fg: string, disabled: boolean): React.CSSProperties => ({
  padding: "4px 10px",
  borderRadius: "6px",
  background: disabled ? "#F3F4F6" : bg,
  color: disabled ? "#9CA3AF" : fg,
  fontSize: "12px",
  fontWeight: 500,
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  whiteSpace: "nowrap",
});

export function PartnerBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [, acceptAction,   ap] = useActionState(acceptBooking,   { error: null });
  const [, declineAction,  dp] = useActionState(declineBooking,  { error: null });
  const [, completeAction, cp] = useActionState(completeBooking, { error: null });

  if (status === "pending") {
    return (
      <div style={{ display: "flex", gap: "6px" }}>
        <form action={acceptAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <button type="submit" disabled={ap} style={btn("#D1FAE5", "#065F46", ap)}>
            {ap ? "…" : "Αποδοχή"}
          </button>
        </form>
        <form action={declineAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <button type="submit" disabled={dp} style={btn("#FEE2E2", "#991B1B", dp)}>
            {dp ? "…" : "Απόρριψη"}
          </button>
        </form>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <form action={completeAction}>
        <input type="hidden" name="bookingId" value={bookingId} />
        <button type="submit" disabled={cp} style={btn("#DBEAFE", "#1D4ED8", cp)}>
          {cp ? "…" : "Ολοκλήρωση"}
        </button>
      </form>
    );
  }

  return null;
}
