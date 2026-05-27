import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types/database";

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const labels: Record<BookingStatus, string> = {
  pending:   "Εκκρεμεί",
  accepted:  "Αποδεκτή",
  rejected:  "Απορρίφθηκε",
  completed: "Ολοκληρώθηκε",
};

const variants: Record<BookingStatus, "pending" | "accepted" | "rejected" | "completed"> = {
  pending:   "pending",
  accepted:  "accepted",
  rejected:  "rejected",
  completed: "completed",
};

export default function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
}
