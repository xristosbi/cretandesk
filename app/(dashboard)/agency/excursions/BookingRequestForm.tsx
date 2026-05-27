"use client";

import { useState, useActionState } from "react";
import { createBooking } from "@/lib/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState = { error: string | null } | undefined;

interface BookingRequestFormProps {
  excursionId: string;
  partnerId: string;
}

export default function BookingRequestForm({ excursionId, partnerId }: BookingRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await createBooking(_prev ?? { error: null }, formData);
      if (!result.error) {
        setSuccess(true);
        setOpen(false);
      }
      return result;
    },
    undefined
  );

  if (success) {
    return (
      <div className="text-center py-2">
        <p className="text-sm text-success font-medium">Το αίτημα υποβλήθηκε!</p>
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        variant="gold"
        size="sm"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        Αίτημα Κράτησης
      </Button>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4 mt-2 space-y-3 bg-background">
      <p className="font-semibold text-navy text-sm">Αίτημα Κράτησης</p>

      {state?.error && (
        <p className="text-danger text-xs">{state.error}</p>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="excursion_id" value={excursionId} />
        <input type="hidden" name="partner_id" value={partnerId} />

        <div className="space-y-1">
          <Label htmlFor={`date-${excursionId}`} className="text-xs">Ημερομηνία *</Label>
          <Input
            id={`date-${excursionId}`}
            name="date"
            type="date"
            required
            className="text-sm h-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor={`adults-${excursionId}`} className="text-xs">Ενήλικες</Label>
            <Input
              id={`adults-${excursionId}`}
              name="persons_adults"
              type="number"
              min="0"
              defaultValue="1"
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`children-${excursionId}`} className="text-xs">Παιδιά</Label>
            <Input
              id={`children-${excursionId}`}
              name="persons_children"
              type="number"
              min="0"
              defaultValue="0"
              className="text-sm h-9"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor={`notes-${excursionId}`} className="text-xs">Σημειώσεις</Label>
          <Textarea
            id={`notes-${excursionId}`}
            name="notes"
            rows={2}
            className="text-sm"
            placeholder="Ειδικές απαιτήσεις..."
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" size="sm" className="flex-1 text-xs" disabled={isPending}>
            {isPending ? "Αποστολή..." : "Υποβολή"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setOpen(false)}
          >
            Ακύρωση
          </Button>
        </div>
      </form>
    </div>
  );
}
