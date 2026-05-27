import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";

export default function SuspendedPage() {
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
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-danger" />
          </div>

          <h1 className="font-display text-2xl font-bold text-navy mb-3">
            Ο λογαριασμός σου έχει ανασταλεί
          </h1>

          <p className="text-muted mb-8 leading-relaxed">
            Η πρόσβαση στον λογαριασμό σου έχει ανασταλεί. Για
            περισσότερες πληροφορίες επικοινώνησε με την υποστήριξη.
          </p>

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
