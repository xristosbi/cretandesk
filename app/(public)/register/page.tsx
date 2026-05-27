import Link from "next/link";
import { Users, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
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
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl font-bold text-navy mb-2">
              Δημιουργία Λογαριασμού
            </h1>
            <p className="text-muted">Επέλεξε τον τύπο του λογαριασμού σου</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Agency */}
            <Link href="/register/agency" className="group block">
              <div className="h-full bg-white rounded-2xl border-2 border-border group-hover:border-navy/30 group-hover:shadow-lg p-8 transition-all text-center">
                <div className="h-16 w-16 rounded-2xl bg-navy flex items-center justify-center mx-auto mb-5">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-xl font-bold text-navy mb-3">
                  Τουριστικό Γραφείο
                </h2>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Κάνε κρατήσεις εκδρομών για τους πελάτες σου από
                  εγκεκριμένους παρόχους στην Κρήτη.
                </p>
                <Button className="w-full group-hover:bg-navy-light">
                  Εγγραφή ως Γραφείο <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>

            {/* Partner */}
            <Link href="/register/partner" className="group block">
              <div className="h-full bg-white rounded-2xl border-2 border-border group-hover:border-gold/40 group-hover:shadow-lg p-8 transition-all text-center">
                <div className="h-16 w-16 rounded-2xl bg-gold flex items-center justify-center mx-auto mb-5">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-xl font-bold text-navy mb-3">
                  Πάροχος Εμπειριών
                </h2>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  Ανέβασε τις εκδρομές σου και δέχτου κρατήσεις από
                  εγκεκριμένα τουριστικά γραφεία.
                </p>
                <Button variant="gold" className="w-full">
                  Εγγραφή ως Πάροχος <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          </div>

          <p className="text-center text-sm text-muted mt-8">
            Έχεις ήδη λογαριασμό;{" "}
            <Link href="/login" className="text-navy font-medium hover:text-gold transition-colors">
              Σύνδεση
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
