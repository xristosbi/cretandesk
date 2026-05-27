import Link from "next/link";
import { Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";

export default function PendingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="font-display text-2xl font-bold text-navy">
            Cretan<span className="text-gold">Desk</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>

          <h1 className="font-display text-2xl font-bold text-navy mb-3">
            Ο λογαριασμός σου είναι υπό έγκριση
          </h1>

          <p className="text-muted mb-6 leading-relaxed">
            Η αίτησή σου έχει υποβληθεί επιτυχώς. Ο διαχειριστής θα
            εξετάσει τα στοιχεία σου και θα λάβεις email μόλις εγκριθεί
            ο λογαριασμός σου.
          </p>

          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-8 text-sm text-blue-700">
            <Mail className="h-5 w-5 flex-shrink-0" />
            <span>Θα λάβεις email επιβεβαίωσης στη διεύθυνση που δήλωσες.</span>
          </div>

          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full">
              Αποσύνδεση
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
