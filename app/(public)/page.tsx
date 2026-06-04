"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Anchor, Mountain, Wind, UtensilsCrossed, Landmark, Crown, Sparkles,
  ArrowRight, Users, MapPin, CalendarCheck, UserPlus, Link2, ChevronDown,
  Shield, Clock, BarChart3, Zap, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Animation helpers ────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCounter(target: number, active: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let t0: number | null = null;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return val;
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────

const categories = [
  { key: "sea",        label: "Θαλάσσια",   icon: Anchor,          bg: "#EFF6FF", color: "#2563EB" },
  { key: "adventure",  label: "Περιπέτεια",  icon: Mountain,        bg: "#FFF7ED", color: "#EA580C" },
  { key: "aerial",     label: "Εναέρια",     icon: Wind,            bg: "#F0F9FF", color: "#0284C7" },
  { key: "gastronomy", label: "Γαστρονομία", icon: UtensilsCrossed, bg: "#FFFBEB", color: "#D97706" },
  { key: "culture",    label: "Πολιτισμός",  icon: Landmark,        bg: "#F5F3FF", color: "#7C3AED" },
  { key: "vip",        label: "VIP",         icon: Crown,           bg: "#FEF9C3", color: "#CA8A04" },
  { key: "niche",      label: "Ειδικές",     icon: Sparkles,        bg: "#F0FDF4", color: "#16A34A" },
];

const features = [
  {
    icon: Shield,
    title: "Εγκεκριμένοι Πάροχοι",
    desc: "Μόνο ελεγμένοι και εγκεκριμένοι πάροχοι. Εγγυημένη ποιότητα και αξιοπιστία για κάθε εκδρομή.",
  },
  {
    icon: Clock,
    title: "Κρατήσεις σε Πραγματικό Χρόνο",
    desc: "Ζωντανή διαθεσιμότητα. Άμεση αποδοχή ή άρνηση κράτησης απευθείας από τον πάροχο.",
  },
  {
    icon: BarChart3,
    title: "Αναλυτικά Στατιστικά",
    desc: "Dashboard με KPIs, ιστορικό κρατήσεων και αναφορές εσόδων για κάθε ρόλο.",
  },
  {
    icon: Zap,
    title: "Αυτόματη Τιμολόγηση",
    desc: "Μηνιαία εκκαθάριση μέσω Stripe. Χωρίς χαρτί, χωρίς καθυστέρηση, χωρίς λάθη.",
  },
];

const steps = [
  {
    num: "01",
    icon: UserPlus,
    title: "Εγγραφή",
    desc: "Δημιούργησε λογαριασμό ως τουριστικό γραφείο ή πάροχος. Ο διαχειριστής εγκρίνει τον λογαριασμό σου.",
  },
  {
    num: "02",
    icon: Link2,
    title: "Σύνδεση",
    desc: "Οι πάροχοι επιλέγουν με ποια γραφεία συνεργάζονται. Αξιόπιστες B2B σχέσεις.",
  },
  {
    num: "03",
    icon: CalendarCheck,
    title: "Κράτηση",
    desc: "Κάνε αίτημα κράτησης, ο πάροχος αποδέχεται και η χρέωση γίνεται αυτόματα.",
  },
];

const statsData = [
  { target: 120,  suffix: "+",  label: "Συνεργάτες", icon: Users },
  { target: 480,  suffix: "+",  label: "Εκδρομές",   icon: MapPin },
  { target: 3200, suffix: "+",  label: "Κρατήσεις",  icon: CalendarCheck },
  { target: 4,    suffix: "",   label: "Περιοχές",   icon: Globe },
];

// ─── Sub-components ───────────────────────────────────────────────

function HowItWorksSteps() {
  const { ref, inView } = useInView(0.2);
  return (
    <div ref={ref} className="relative">
      {/* Animated connector line */}
      <div className="hidden md:block absolute top-7 left-0 right-0 h-px overflow-hidden">
        <div
          style={{
            height: "1px",
            background: "linear-gradient(to right, transparent 8%, #E8A020 30%, #E8A020 70%, transparent 92%)",
            width: inView ? "100%" : "0%",
            transition: "width 1.3s ease 0.4s",
          }}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map(({ num, icon: Icon, title, desc }, i) => (
          <div
            key={num}
            className="flex flex-col items-center text-center"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(32px)",
              transition: `opacity 0.6s ease ${i * 180 + 400}ms, transform 0.6s ease ${i * 180 + 400}ms`,
            }}
          >
            {/* Step icon circle */}
            <div className="relative mb-8 z-10">
              <div className="h-14 w-14 rounded-full bg-white border-2 border-navy/15 shadow-lg flex items-center justify-center">
                <Icon className="h-6 w-6 text-navy" />
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gold flex items-center justify-center text-xs font-bold text-white shadow-md">
                {i + 1}
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl px-7 py-8 w-full shadow-sm hover:shadow-md transition-shadow duration-300">
              <div
                className="font-display text-5xl font-bold leading-none mb-3 select-none"
                style={{ color: "#1B3A5C", opacity: 0.07 }}
              >
                {num}
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-3">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCounter({
  target,
  suffix,
  label,
  icon: Icon,
}: {
  target: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
}) {
  const { ref, inView } = useInView(0.3);
  const val = useCounter(target, inView);
  return (
    <div ref={ref} className="text-center">
      <div className="flex justify-center mb-5">
        <div className="h-16 w-16 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center">
          <Icon className="h-8 w-8 text-gold" />
        </div>
      </div>
      <div
        className="font-display text-5xl font-bold text-white mb-2"
        style={{ opacity: inView ? 1 : 0, transition: "opacity 0.5s ease 0.3s" }}
      >
        {target >= 1000 ? val.toLocaleString("el-GR") : val}
        {suffix}
      </div>
      <div className="text-white/50 text-sm font-medium uppercase tracking-widest">{label}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
        style={{
          background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          boxShadow: scrolled ? "0 1px 0 #E2E8F0" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: 72 }}>
          <Link href="/">
            <span
              className="font-display text-2xl font-bold transition-colors duration-300"
              style={{ color: scrolled ? "#1B3A5C" : "#ffffff" }}
            >
              Cretan<span className="text-gold">Desk</span>
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="transition-colors duration-300"
                style={{ color: scrolled ? "#1B3A5C" : "rgba(255,255,255,0.85)" }}
              >
                Σύνδεση
              </Button>
            </Link>
            <Link href="/register/agency">
              <Button
                size="sm"
                className="bg-gold hover:bg-gold-dark text-white shadow-sm font-medium"
              >
                Εγγραφή
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── 1. HERO ── */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: "100svh",
          minHeight: 600,
          backgroundImage: "url('https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />

        {/* Bottom fade into page bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-36"
          style={{ background: "linear-gradient(to top, #F7F8FA, transparent)" }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-8"
            style={{
              background: "rgba(232,160,32,0.18)",
              border: "1px solid rgba(232,160,32,0.45)",
              color: "#E8A020",
              backdropFilter: "blur(4px)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Crete&apos;s Experience Marketplace
          </div>

          <h1
            className="font-display font-bold text-white leading-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
          >
            Η πλατφόρμα που συνδέει τα{" "}
            <span className="text-gold">τουριστικά γραφεία</span>{" "}
            με τις εμπειρίες της Κρήτης
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Κρατήσεις εκδρομών σε πραγματικό χρόνο. Διαχείριση διαθεσιμότητας.
            Αυτόματες χρεώσεις. Όλα σε ένα μέρος.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/agency">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-white font-semibold px-9 text-base h-14 shadow-2xl"
                style={{ boxShadow: "0 8px 32px rgba(232,160,32,0.35)" }}
              >
                Είμαι Τουριστικό Γραφείο
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <a
              href="/register/partner"
              style={{ display: "inline-block", border: "2px solid white", color: "white", background: "transparent", padding: "12px 32px", borderRadius: "8px", fontWeight: 500, fontSize: "16px", textDecoration: "none" }}
            >
              Εγγραφή ως Συνεργάτης →
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/40 animate-bounce">
          <span className="text-xs tracking-[0.2em] uppercase font-medium">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ── */}
      <section className="py-24 bg-[#F7F8FA]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-gold text-sm font-semibold uppercase tracking-[0.15em]">Πώς Λειτουργεί</span>
            <h2 className="font-display text-4xl md:text-[3.25rem] font-bold text-navy mt-3 mb-4 leading-tight">
              Τρία απλά βήματα
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Από την εγγραφή ως την πρώτη κράτηση σε λίγα λεπτά
            </p>
          </FadeIn>

          <HowItWorksSteps />
        </div>
      </section>

      {/* ── 3. WHAT WE DO ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-gold text-sm font-semibold uppercase tracking-[0.15em]">Τι Κάνουμε</span>
            <h2 className="font-display text-4xl md:text-[3.25rem] font-bold text-navy mt-3 mb-4 leading-tight">
              Η πλατφόρμα για κάθε ανάγκη
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Ένα ολοκληρωμένο B2B σύστημα διαχείρισης εκδρομών για την Κρήτη
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 90}>
                <div className="group bg-white border border-border rounded-2xl p-7 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-navy/15 cursor-default" style={{ boxShadow: "0 1px 4px rgba(27,58,92,0.06)" }}>
                  <div className="h-12 w-12 rounded-xl bg-navy/5 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-navy group-hover:scale-110">
                    <Icon className="h-6 w-6 text-navy transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <h3 className="font-semibold text-navy text-[0.95rem] mb-2.5">{title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CATEGORIES ── */}
      <section className="py-24 bg-[#F7F8FA]">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-gold text-sm font-semibold uppercase tracking-[0.15em]">Κατηγορίες</span>
            <h2 className="font-display text-4xl md:text-[3.25rem] font-bold text-navy mt-3 mb-4 leading-tight">
              7 Κατηγορίες Εμπειριών
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Από θαλάσσιες περιπέτειες ως γαστρονομικές ανακαλύψεις και πολιτιστικές εξορμήσεις
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map(({ key, label, icon: Icon, bg, color }, i) => (
              <FadeIn key={key} delay={i * 60}>
                <div className="group flex flex-col items-center gap-3.5 p-5 rounded-2xl bg-white border border-border transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-navy/15 cursor-default" style={{ boxShadow: "0 1px 3px rgba(27,58,92,0.05)" }}>
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
                    style={{ background: bg }}
                  >
                    <Icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" style={{ color }} />
                  </div>
                  <span className="text-sm font-semibold text-navy text-center leading-tight">{label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. STATS ── */}
      <section className="py-24 bg-navy relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(232,160,32,0.07)", filter: "blur(80px)", transform: "translate(-50%,-50%)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(232,160,32,0.05)", filter: "blur(80px)", transform: "translate(50%,50%)" }} />

        <div className="relative max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-gold text-sm font-semibold uppercase tracking-[0.15em]">Αριθμοί</span>
            <h2 className="font-display text-4xl md:text-[3.25rem] font-bold text-white mt-3 mb-4 leading-tight">
              Η πλατφόρμα σε αριθμούς
            </h2>
            <p className="text-white/45 text-lg max-w-xl mx-auto">
              Αναπτυσσόμαστε κάθε μέρα με νέες συνεργασίες και κρατήσεις σε όλη την Κρήτη
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {statsData.map((s) => (
              <StatCounter key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. WHO WE ARE ── */}
      <section className="py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            {/* Decorative quote mark */}
            <div
              className="font-display font-bold leading-none mb-2 select-none"
              style={{ fontSize: "7rem", color: "#E8A020", opacity: 0.18, lineHeight: 1 }}
            >
              &ldquo;
            </div>
            <span className="text-gold text-sm font-semibold uppercase tracking-[0.15em]">Ποιοι Είμαστε</span>
            <h2 className="font-display text-4xl md:text-[3.25rem] font-bold text-navy mt-3 mb-7 leading-tight">
              Η αγορά των εμπειριών<br />της Κρήτης
            </h2>
            <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto mb-5">
              Το CretanDesk δημιουργήθηκε για να γεφυρώσει το χάσμα μεταξύ τουριστικών γραφείων
              και παρόχων εμπειριών στην Κρήτη. Πιστεύουμε ότι κάθε επισκέπτης αξίζει
              την καλύτερη εμπειρία — και κάθε επιχείρηση αξίζει τα κατάλληλα εργαλεία.
            </p>
            <p className="text-muted text-base leading-relaxed max-w-2xl mx-auto">
              Από τη θάλασσα του Ηρακλείου ως τα βουνά των Χανίων, συνδέουμε επαγγελματίες
              του τουρισμού με αξιόπιστες, ελεγμένες εμπειρίες — σε πραγματικό χρόνο,
              με πλήρη διαφάνεια και αυτοματοποιημένη χρέωση.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 7. FINAL CTA ── */}
      <section className="py-28 bg-navy relative overflow-hidden">
        {/* Subtle texture */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(232,160,32,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.04) 0%, transparent 50%)" }} />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <span className="text-gold text-sm font-semibold uppercase tracking-[0.15em]">Ξεκίνα Τώρα</span>
            <h2 className="font-display text-4xl md:text-[3.25rem] font-bold text-white mt-3 mb-5 leading-tight">
              Έτοιμος να αναπτύξεις{" "}
              <span className="text-gold">την επιχείρησή σου;</span>
            </h2>
            <p className="text-white/55 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Εγγράψου σήμερα και ξεκίνα να κάνεις κρατήσεις ή να δέχεσαι αιτήματα
              από εγκεκριμένα τουριστικά γραφεία σε όλη την Κρήτη.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register/agency">
                <Button
                  size="lg"
                  className="bg-gold hover:bg-gold-dark text-white font-semibold px-9 text-base h-14"
                  style={{ boxShadow: "0 8px 32px rgba(232,160,32,0.30)" }}
                >
                  Εγγραφή ως Γραφείο
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <a
                href="/register/partner"
                style={{ display: "inline-block", border: "2px solid white", color: "white", background: "transparent", padding: "12px 32px", borderRadius: "8px", fontWeight: 500, fontSize: "16px", textDecoration: "none" }}
              >
                Εγγραφή ως Συνεργάτης →
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#122840] text-white/40">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-display text-xl font-bold text-white mb-1">
                Cretan<span className="text-gold">Desk</span>
              </div>
              <p className="text-sm">Crete&apos;s Experience Marketplace</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/login" className="hover:text-white transition-colors duration-200">Σύνδεση</Link>
              <Link href="/register/agency" className="hover:text-white transition-colors duration-200">Γραφεία</Link>
              <Link href="/register/partner" className="hover:text-white transition-colors duration-200">Πάροχοι</Link>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-xs" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            © {new Date().getFullYear()} CretanDesk. Όλα τα δικαιώματα διατηρούνται.
          </div>
        </div>
      </footer>
    </div>
  );
}
