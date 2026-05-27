import Link from "next/link";
import {
  Anchor, Mountain, Wind, UtensilsCrossed,
  Landmark, Crown, Sparkles, ArrowRight,
  Users, MapPin, CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { key: "sea",         label: "Θαλάσσια",     icon: Anchor,           color: "bg-blue-50   text-blue-600" },
  { key: "adventure",   label: "Περιπέτεια",    icon: Mountain,         color: "bg-orange-50 text-orange-600" },
  { key: "aerial",      label: "Εναέρια",       icon: Wind,             color: "bg-sky-50    text-sky-600" },
  { key: "gastronomy",  label: "Γαστρονομία",   icon: UtensilsCrossed,  color: "bg-amber-50  text-amber-600" },
  { key: "culture",     label: "Πολιτισμός",    icon: Landmark,         color: "bg-purple-50 text-purple-600" },
  { key: "vip",         label: "VIP",            icon: Crown,            color: "bg-yellow-50 text-yellow-600" },
  { key: "niche",       label: "Ειδικές",        icon: Sparkles,         color: "bg-green-50  text-green-600" },
];

const stats = [
  { value: "120+", label: "Συνεργάτες",   icon: Users },
  { value: "480+", label: "Εκδρομές",     icon: MapPin },
  { value: "3.200+", label: "Κρατήσεις", icon: CalendarCheck },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-navy">
              Cretan<span className="text-gold">Desk</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link href="/register">
              <Button variant="outline" size="sm">Εγγραφή</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Σύνδεση</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B3A5C 0%, #2a5480 60%, #1B3A5C 100%)" }}
      >
        {/* Decorative wave */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1440 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <path d="M0,300 C360,100 1080,500 1440,300 L1440,600 L0,600 Z" fill="#E8A020" />
            <path d="M0,400 C480,200 960,600 1440,400 L1440,600 L0,600 Z" fill="white" opacity="0.5" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold border border-gold/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Crete&apos;s Experience Marketplace
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl mx-auto">
            Η πλατφόρμα που συνδέει τα{" "}
            <span className="text-gold">τουριστικά γραφεία</span>{" "}
            με τις εμπειρίες της Κρήτης
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Κρατήσεις εκδρομών σε πραγματικό χρόνο. Διαχείριση διαθεσιμότητας.
            Αυτόματες χρεώσεις. Όλα σε ένα μέρος.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/agency">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-white font-semibold px-8 shadow-lg shadow-gold/30"
              >
                Είμαι Τουριστικό Γραφείο
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register/partner">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white px-8"
              >
                Είμαι Πάροχος Εμπειριών
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-3 gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-full bg-navy/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-navy" />
                  </div>
                </div>
                <div className="font-display text-3xl font-bold text-navy">{value}</div>
                <div className="text-muted text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
              Πώς λειτουργεί
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Τρία απλά βήματα για να ξεκινήσεις να κάνεις κρατήσεις
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Εγγραφή & Έγκριση",
                desc: "Δημιούργησε λογαριασμό ως γραφείο ή πάροχος. Ο διαχειριστής εγκρίνει τον λογαριασμό σου.",
              },
              {
                step: "02",
                title: "Σύνδεση με Παρόχους",
                desc: "Οι πάροχοι επιλέγουν με ποια γραφεία συνεργάζονται. Αμόλυβδο σύστημα σχέσεων B2B.",
              },
              {
                step: "03",
                title: "Κρατήσεις & Πληρωμές",
                desc: "Κάνε αίτημα κράτησης, ο πάροχος αποδέχεται, ο λογισμός γίνεται αυτόματα.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative bg-white rounded-xl border border-border p-8">
                <div className="font-display text-5xl font-bold text-navy/10 mb-4 leading-none">
                  {step}
                </div>
                <h3 className="font-display text-lg font-semibold text-navy mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Cards ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
              Ξεκίνα σήμερα
            </h2>
            <p className="text-muted">Επέλεξε τον ρόλο σου στην αγορά</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Agency card */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-navy/10 bg-gradient-to-br from-navy/5 to-navy/10 p-10 hover:border-navy/30 transition-all">
              <div className="h-14 w-14 rounded-xl bg-navy flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-navy mb-3">
                Τουριστικό Γραφείο
              </h3>
              <p className="text-muted mb-8 leading-relaxed">
                Βρες και κράτα εκδρομές από εγκεκριμένους παρόχους. Διαχειρίσου
                όλες σου τις κρατήσεις σε ένα dashboard. Αυτόματη τιμολόγηση.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-muted">
                {["Πρόσβαση σε όλους τους παρόχους", "Ημερολόγιο κρατήσεων", "Ιστορικό & αναφορές"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-gold flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register/agency">
                <Button className="w-full group-hover:bg-navy-light">
                  Εγγραφή ως Γραφείο
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Partner card */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-gold/20 bg-gradient-to-br from-gold/5 to-gold/10 p-10 hover:border-gold/40 transition-all">
              <div className="h-14 w-14 rounded-xl bg-gold flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-navy mb-3">
                Πάροχος Εμπειριών
              </h3>
              <p className="text-muted mb-8 leading-relaxed">
                Ανέβασε τις εκδρομές σου, διαχειρίσου τη διαθεσιμότητα και δέχτου
                κρατήσεις από εγκεκριμένα γραφεία. Μηνιαία τακτοποίηση μέσω Stripe.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-muted">
                {["Διαχείριση εκδρομών & φωτογραφιών", "Ημερολόγιο διαθεσιμότητας", "Αυτόματη χρέωση 0,50€/άτομο"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-gold flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register/partner">
                <Button variant="gold" className="w-full">
                  Εγγραφή ως Πάροχος
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
              Κατηγορίες Εκδρομών
            </h2>
            <p className="text-muted">7 κατηγορίες εμπειριών στην Κρήτη</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map(({ key, label, icon: Icon, color }) => (
              <div
                key={key}
                className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white border border-border hover:border-navy/20 hover:shadow-md transition-all cursor-default"
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-navy text-center leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto bg-navy text-white/60">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-display text-xl font-bold text-white mb-1">
                Cretan<span className="text-gold">Desk</span>
              </div>
              <p className="text-sm">Crete&apos;s Experience Marketplace</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/login"   className="hover:text-white transition-colors">Σύνδεση</Link>
              <Link href="/register/agency"  className="hover:text-white transition-colors">Γραφεία</Link>
              <Link href="/register/partner" className="hover:text-white transition-colors">Πάροχοι</Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs">
            © {new Date().getFullYear()} CretanDesk. Όλα τα δικαιώματα διατηρούνται.
          </div>
        </div>
      </footer>
    </div>
  );
}
