"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Anchor, Mountain, Wind, UtensilsCrossed, Landmark, Crown, Sparkles,
  ArrowRight, Users, MapPin, CalendarCheck, UserPlus, Link2, ChevronDown,
  Shield, Clock, BarChart3, Zap, Globe, CheckCircle2,
} from "lucide-react";

// ─── Animation ────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
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

function useCounter(target: number, active: boolean, duration = 2000) {
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

type FadeProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
};

function FadeIn({ children, delay = 0, className = "", direction = "up" }: FadeProps) {
  const { ref, inView } = useInView();
  const startTransform =
    direction === "left"  ? "translateX(-40px)" :
    direction === "right" ? "translateX(40px)"  :
                            "translateY(40px)";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translate(0,0)" : startTransform,
        transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────

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
    accent: "#1B3A5C",
    accentLight: "#EEF2F7",
    title: "Εγκεκριμένοι Πάροχοι",
    subtitle: "Εμπιστοσύνη σε κάθε σχέση",
    desc: "Μόνο ελεγμένοι και εγκεκριμένοι πάροχοι εμπειριών έχουν πρόσβαση στην πλατφόρμα. Κάθε συνεργασία ξεκινά με έλεγχο ταυτότητας και έγκριση από τη διαχείριση.",
    points: ["Αξιολόγηση πριν την έγκριση", "Πλήρη στοιχεία επιχείρησης", "Σύστημα αξιολόγησης"],
  },
  {
    icon: Clock,
    accent: "#E8A020",
    accentLight: "#FFFBEB",
    title: "Κρατήσεις σε Πραγματικό Χρόνο",
    subtitle: "Μηδέν καθυστέρηση, άμεση απόκριση",
    desc: "Ζωντανό ημερολόγιο διαθεσιμότητας. Αίτημα κράτησης — αποδοχή ή άρνηση από τον πάροχο — και αυτόματη email ειδοποίηση σε δευτερόλεπτα.",
    points: ["Ζωντανή διαθεσιμότητα ανά ημέρα", "Αυτόματες ειδοποιήσεις email", "Ιστορικό κρατήσεων ανά ρόλο"],
  },
  {
    icon: BarChart3,
    accent: "#2D9B6F",
    accentLight: "#ECFDF5",
    title: "Αναλυτικά Στατιστικά",
    subtitle: "Αποφάσεις βασισμένες σε δεδομένα",
    desc: "Dashboard με όλες τις μετρήσεις που χρειάζεσαι: κρατήσεις, έσοδα, ενεργοί πάροχοι, μηνιαία τάση. Για κάθε ρόλο, το σωστό επίπεδο ανάλυσης.",
    points: ["KPIs σε πραγματικό χρόνο", "Αναφορές ανά περίοδο", "Σύγκριση μηνών"],
  },
  {
    icon: Zap,
    accent: "#7C3AED",
    accentLight: "#F5F3FF",
    title: "Αυτόματη Τιμολόγηση",
    subtitle: "Stripe-powered, χωρίς χαρτί",
    desc: "Μηνιαία εκκαθάριση 0,50€ ανά άτομο — δημιουργία Stripe Invoice, αποστολή email πληρωμής και παρακολούθηση εξόφλησης. Τίποτα δεν χάνεται.",
    points: ["Αυτόματη δημιουργία τιμολογίου", "Stripe Invoice & webhook", "Dashboard πληρωμών"],
  },
];

const steps = [
  {
    num: "01",
    icon: UserPlus,
    title: "Εγγραφή",
    desc: "Δημιούργησε λογαριασμό ως τουριστικό γραφείο ή πάροχος εμπειριών. Ο διαχειριστής ελέγχει και εγκρίνει κάθε νέο λογαριασμό.",
  },
  {
    num: "02",
    icon: Link2,
    title: "Σύνδεση",
    desc: "Οι πάροχοι επιλέγουν με ποια τουριστικά γραφεία συνεργάζονται. Αξιόπιστες, εγκεκριμένες B2B σχέσεις.",
  },
  {
    num: "03",
    icon: CalendarCheck,
    title: "Κράτηση",
    desc: "Αίτημα κράτησης από το γραφείο, αποδοχή από τον πάροχο, και η χρέωση γίνεται αυτόματα — χωρίς τηλέφωνα.",
  },
];

const statsData = [
  { target: 120,  suffix: "+", label: "Συνεργάτες" },
  { target: 480,  suffix: "+", label: "Εκδρομές" },
  { target: 3200, suffix: "+", label: "Κρατήσεις" },
  { target: 4,    suffix: "",  label: "Περιοχές" },
];

// ─── Dashboard Mockup ─────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 50px 140px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
      maxWidth: 860,
      margin: "0 auto",
    }}>
      {/* Browser chrome */}
      <div style={{
        background: "#1E2530",
        padding: "9px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {["#FF5F57", "#FFBD2E", "#28CA41"].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{
          flex: 1,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 5,
          padding: "4px 12px",
          fontSize: 11,
          color: "rgba(255,255,255,0.25)",
          textAlign: "center",
        }}>
          app.cretandesk.gr/partner
        </div>
        <div style={{ width: 62, flexShrink: 0 }} />
      </div>

      {/* App shell */}
      <div style={{ display: "flex", background: "#F4F6F9", minHeight: 360 }}>

        {/* Sidebar */}
        <div style={{
          width: 180,
          background: "#1B3A5C",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, color: "white", fontSize: 13, letterSpacing: "0.01em" }}>
              Cretan<span style={{ color: "#E8A020" }}>Desk</span>
            </span>
          </div>
          <div style={{ padding: "8px 0", flex: 1 }}>
            {[
              { label: "Επισκόπηση", active: true },
              { label: "Εκδρομές",  active: false },
              { label: "Κρατήσεις", active: false },
              { label: "Γραφεία",   active: false },
              { label: "Πληρωμές",  active: false },
            ].map(item => (
              <div key={item.label} style={{
                padding: "7px 14px",
                margin: "1px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                background: item.active ? "rgba(232,160,32,0.16)" : "transparent",
                color: item.active ? "#E8A020" : "rgba(255,255,255,0.4)",
              }}>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "14px 16px", overflow: "hidden" }}>
          {/* Greeting bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1B3A5C" }}>Καλημέρα, Aegean Cruises</div>
            <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 2 }}>Επισκόπηση κρατήσεών σου</div>
          </div>

          {/* Stat cards row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
            {[
              { val: "124", label: "Κρατήσεις", delta: "+12%", ok: true },
              { val: "48",  label: "Γραφεία",   delta: "+3",   ok: true },
              { val: "€640",label: "Έσοδα",     delta: "+8%",  ok: true },
            ].map(s => (
              <div key={s.label} style={{
                background: "white",
                borderRadius: 8,
                padding: "10px 12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                border: "1px solid #EEF0F3",
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1B3A5C", lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 8, color: "#9CA3AF", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                <div style={{ fontSize: 9, color: "#2D9B6F", marginTop: 3, fontWeight: 600 }}>{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Bookings table */}
          <div style={{
            background: "white",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid #EEF0F3",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}>
            <div style={{
              padding: "9px 12px",
              borderBottom: "1px solid #F0F2F5",
              fontSize: 10,
              fontWeight: 700,
              color: "#1B3A5C",
            }}>
              Τελευταίες Κρατήσεις
            </div>
            {[
              { agency: "Sunlight Travel",   excursion: "Σπηλαιοβύθιση Ρεθύμνου", status: "Εγκρίθηκε", sb: "#D1FAE5", sc: "#065F46" },
              { agency: "Blue Aegean Tours", excursion: "Ηλιοβασίλεμα Σφακίων",   status: "Αναμονή",   sb: "#FEF3C7", sc: "#92400E" },
              { agency: "Paradise Routes",   excursion: "Γαστρονομία Χανίων",     status: "Εγκρίθηκε", sb: "#D1FAE5", sc: "#065F46" },
            ].map((row, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 12px",
                borderBottom: i < 2 ? "1px solid #F5F6F8" : "none",
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#1B3A5C", whiteSpace: "nowrap" }}>{row.agency}</div>
                  <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 1, whiteSpace: "nowrap" }}>{row.excursion}</div>
                </div>
                <div style={{
                  padding: "2px 7px",
                  borderRadius: 4,
                  background: row.sb,
                  color: row.sc,
                  fontSize: 9,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginLeft: 8,
                }}>
                  {row.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── How It Works Steps ───────────────────────────────────────────

function HowItWorksSteps() {
  const { ref, inView } = useInView(0.15);
  return (
    <div ref={ref} className="grid md:grid-cols-3 gap-0 md:divide-x md:divide-white/10">
      {steps.map(({ num, title, desc }, i) => (
        <div
          key={num}
          className="px-10 py-8 md:py-0 first:pl-0 last:pr-0"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(48px)",
            transition: `opacity 0.7s ease ${i * 160 + 200}ms, transform 0.7s ease ${i * 160 + 200}ms`,
          }}
        >
          <div
            className="font-display font-bold leading-none mb-6 select-none"
            style={{ fontSize: "clamp(4.5rem, 9vw, 8rem)", color: "#E8A020", opacity: 0.9 }}
          >
            {num}
          </div>
          <h3 className="font-display text-2xl font-bold text-navy mb-4">{title}</h3>
          <p className="text-muted text-base leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Stat counter ─────────────────────────────────────────────────

function StatCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { ref, inView } = useInView(0.3);
  const val = useCounter(target, inView);
  return (
    <div ref={ref} className="text-center" style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    }}>
      <div
        className="font-display font-bold leading-none mb-3"
        style={{ fontSize: "clamp(3.5rem, 7vw, 6rem)", color: "#E8A020" }}
      >
        {target >= 1000 ? val.toLocaleString("el-GR") : val}{suffix}
      </div>
      <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </div>
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
    <div className="flex flex-col" style={{ background: "#FAFBFC" }}>

      {/* ── Header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.08)" : "none",
          transition: "background 0.3s, box-shadow 0.3s",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: 72 }}>
          <Link href="/">
            <span
              className="font-display text-2xl font-bold"
              style={{ color: scrolled ? "#1B3A5C" : "#fff", transition: "color 0.3s" }}
            >
              Cretan<span style={{ color: "#E8A020" }}>Desk</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <span
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: scrolled ? "#1B3A5C" : "rgba(255,255,255,0.85)" }}
              >
                Σύνδεση
              </span>
            </Link>
            <a
              href="/register/agency"
              style={{
                display: "inline-block",
                background: "#E8A020",
                color: "white",
                padding: "8px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Εγγραφή
            </a>
          </nav>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          backgroundImage: "url('https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: 160,
          paddingBottom: 100,
        }}
      >
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(10,20,40,0.82) 0%, rgba(20,40,70,0.72) 50%, rgba(10,20,40,0.88) 100%)" }} />
        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, #FAFBFC, transparent)" }} />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(232,160,32,0.15)", border: "1px solid rgba(232,160,32,0.4)",
            color: "#E8A020", borderRadius: 100, padding: "6px 16px",
            fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: 32, backdropFilter: "blur(4px)",
          }}>
            <Sparkles style={{ width: 12, height: 12 }} />
            Crete&apos;s B2B Experience Marketplace
          </div>

          {/* Main headline */}
          <h1
            className="font-display font-bold text-white"
            style={{
              fontSize: "clamp(3rem, 7vw, 6.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: 28,
              textShadow: "0 4px 30px rgba(0,0,0,0.4)",
            }}
          >
            Η πλατφόρμα που συνδέει τα{" "}
            <span style={{ color: "#E8A020" }}>τουριστικά γραφεία</span>{" "}
            με τις εμπειρίες της Κρήτης
          </h1>

          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "clamp(1rem, 2vw, 1.2rem)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 44px" }}>
            Κρατήσεις σε πραγματικό χρόνο. Διαχείριση διαθεσιμότητας.
            Αυτόματη τιμολόγηση Stripe. Όλα σε ένα B2B dashboard.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 72 }}>
            <a
              href="/register/agency"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#E8A020", color: "white",
                padding: "15px 36px", borderRadius: 10,
                fontSize: 16, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 8px 32px rgba(232,160,32,0.4)",
                transition: "transform 0.2s",
              }}
            >
              Είμαι Τουριστικό Γραφείο
              <ArrowRight style={{ width: 18, height: 18 }} />
            </a>
            <a
              href="/register/partner"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "transparent", color: "white",
                border: "2px solid rgba(255,255,255,0.5)",
                padding: "15px 36px", borderRadius: 10,
                fontSize: 16, fontWeight: 600, textDecoration: "none",
              }}
            >
              Είμαι Πάροχος Εμπειριών
              <ArrowRight style={{ width: 18, height: 18 }} />
            </a>
          </div>

          {/* Dashboard mockup */}
          <DashboardMockup />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce" style={{ color: "rgba(255,255,255,0.3)" }}>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>Scroll</span>
          <ChevronDown style={{ width: 16, height: 16 }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 0", background: "white" }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="mb-20">
            <span style={{ color: "#E8A020", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em" }}>
              Πώς Λειτουργεί
            </span>
            <h2
              className="font-display font-bold text-navy"
              style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)", lineHeight: 1.1, marginTop: 12, letterSpacing: "-0.02em", maxWidth: 640 }}
            >
              Από την εγγραφή ως την πρώτη κράτηση σε τρία βήματα
            </h2>
          </FadeIn>
          <HowItWorksSteps />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. WHAT WE DO — alternating sections
      ══════════════════════════════════════════════════════════════ */}
      {features.map(({ icon: Icon, accent, accentLight, title, subtitle, desc, points }, i) => (
        <section
          key={title}
          style={{ padding: "100px 0", background: i % 2 === 0 ? "#F7F9FC" : "white" }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 60,
                alignItems: "center",
              }}
              className={`md:!flex-row${i % 2 === 1 ? "-reverse" : ""} md:gap-24`}
            >
              {/* Text */}
              <FadeIn
                direction={i % 2 === 0 ? "left" : "right"}
                className="flex-1 w-full"
              >
                <span style={{ color: accent, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em" }}>
                  0{i + 1}
                </span>
                <h3
                  className="font-display font-bold text-navy"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", lineHeight: 1.15, marginTop: 14, marginBottom: 8, letterSpacing: "-0.02em" }}
                >
                  {title}
                </h3>
                <p style={{ color: accent, fontSize: 15, fontWeight: 600, marginBottom: 20 }}>{subtitle}</p>
                <p style={{ color: "#6B7A8D", fontSize: 17, lineHeight: 1.75, marginBottom: 28, maxWidth: 480 }}>{desc}</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {points.map(pt => (
                    <li key={pt} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CheckCircle2 style={{ width: 18, height: 18, color: accent, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{pt}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>

              {/* Visual — feature card mockup */}
              <FadeIn
                direction={i % 2 === 0 ? "right" : "left"}
                delay={120}
                className="flex-1 w-full"
              >
                <div style={{
                  background: "white",
                  border: "1px solid #E4E8F0",
                  borderRadius: 20,
                  padding: 28,
                  boxShadow: `0 20px 60px ${accent}14, 0 4px 16px rgba(0,0,0,0.05)`,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {/* Top accent stripe */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: "20px 20px 0 0" }} />

                  {/* Icon header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: accentLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon style={{ width: 20, height: 20, color: accent }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1B3A5C" }}>{title}</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{subtitle}</div>
                    </div>
                  </div>

                  {/* Mock data rows */}
                  {[80, 55, 90, 65].map((w, j) => (
                    <div key={j} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 0",
                      borderBottom: j < 3 ? "1px solid #F3F4F6" : "none",
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: j === 0 ? accentLight : "#F3F4F6", flexShrink: 0 }} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ height: 7, borderRadius: 4, background: "#E8ECF4", width: `${w}%` }} />
                        <div style={{ height: 5, borderRadius: 4, background: "#F0F2F5", width: `${w * 0.6}%` }} />
                      </div>
                      <div style={{
                        padding: "3px 8px",
                        borderRadius: 5,
                        background: j % 2 === 0 ? accentLight : "#F0F2F5",
                        fontSize: 9,
                        fontWeight: 700,
                        color: j % 2 === 0 ? accent : "#9CA3AF",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>
                        {j % 2 === 0 ? "✓" : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      ))}

      {/* ══════════════════════════════════════════════════════════════
          4. CATEGORIES
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 0", background: "#F7F9FC" }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <span style={{ color: "#E8A020", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em" }}>
              Κατηγορίες
            </span>
            <h2
              className="font-display font-bold text-navy"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.75rem)", lineHeight: 1.1, marginTop: 12, marginBottom: 14, letterSpacing: "-0.02em" }}
            >
              7 Κατηγορίες Εμπειριών
            </h2>
            <p style={{ color: "#6B7A8D", fontSize: 18, maxWidth: 520, margin: "0 auto" }}>
              Από θαλάσσιες περιπέτειες ως γαστρονομικές ανακαλύψεις
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map(({ key, label, icon: Icon, bg, color }, i) => (
              <FadeIn key={key} delay={i * 55}>
                <div
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                    padding: 20, borderRadius: 18,
                    background: "white",
                    border: "1px solid #E8ECF4",
                    cursor: "default",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    boxShadow: "0 1px 4px rgba(27,58,92,0.05)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(27,58,92,0.12)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(27,58,92,0.05)";
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: 26, height: 26, color }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1B3A5C", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          5. STATS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 0", background: "#1B3A5C", position: "relative", overflow: "hidden" }}>
        {/* Subtle texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 15% 50%, rgba(232,160,32,0.08) 0%, transparent 45%), radial-gradient(circle at 85% 50%, rgba(255,255,255,0.03) 0%, transparent 45%)", pointerEvents: "none" }} />

        <div className="relative max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <span style={{ color: "#E8A020", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em" }}>
              Αριθμοί
            </span>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.75rem)", lineHeight: 1.1, marginTop: 12, color: "white", letterSpacing: "-0.02em" }}
            >
              Η πλατφόρμα σε αριθμούς
            </h2>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "48px 32px" }}
               className="md:!grid-cols-4">
            {statsData.map((s, i) => (
              <FadeIn key={s.label} delay={i * 100}>
                <StatCounter {...s} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          6. WHO WE ARE
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 0", background: "white" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div
            style={{ display: "flex", flexDirection: "column", gap: 48, alignItems: "flex-start" }}
            className="md:!flex-row md:items-center md:gap-24"
          >
            {/* Left: headline */}
            <FadeIn direction="left" className="flex-1">
              <span style={{ color: "#E8A020", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em" }}>
                Ποιοι Είμαστε
              </span>
              <h2
                className="font-display font-bold text-navy"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)", lineHeight: 1.1, marginTop: 16, letterSpacing: "-0.02em" }}
              >
                Η αγορά των εμπειριών της Κρήτης.
              </h2>
              <div style={{ width: 60, height: 4, background: "#E8A020", borderRadius: 2, marginTop: 28 }} />
            </FadeIn>

            {/* Right: text */}
            <FadeIn direction="right" delay={100} className="flex-1">
              <p style={{ color: "#374151", fontSize: 18, lineHeight: 1.8, marginBottom: 20 }}>
                Το CretanDesk δημιουργήθηκε για να γεφυρώσει το χάσμα μεταξύ τουριστικών
                γραφείων και παρόχων εμπειριών στην Κρήτη. Πιστεύουμε ότι κάθε επισκέπτης
                αξίζει την καλύτερη εμπειρία — και κάθε επιχείρηση αξίζει τα κατάλληλα
                εργαλεία.
              </p>
              <p style={{ color: "#6B7A8D", fontSize: 16, lineHeight: 1.8 }}>
                Από τη θάλασσα του Ηρακλείου ως τα βουνά των Χανίων, συνδέουμε
                επαγγελματίες του τουρισμού με αξιόπιστες εμπειρίες — σε πραγματικό
                χρόνο, με πλήρη διαφάνεια και αυτοματοποιημένη χρέωση.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          7. FINAL CTA
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 0", background: "#1B3A5C", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 60%, rgba(232,160,32,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 40%, rgba(255,255,255,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <span style={{ color: "#E8A020", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em" }}>
              Ξεκίνα Τώρα
            </span>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.1, marginTop: 16, marginBottom: 20, letterSpacing: "-0.02em", color: "#E8A020" }}
            >
              Έτοιμος να αναπτύξεις<br />την επιχείρησή σου;
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 18, lineHeight: 1.7, maxWidth: 540, margin: "0 auto 48px" }}>
              Εγγράψου σήμερα και ξεκίνα να κάνεις κρατήσεις ή να δέχεσαι αιτήματα
              από εγκεκριμένα τουριστικά γραφεία σε όλη την Κρήτη.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
              <a
                href="/register/agency"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#E8A020", color: "white",
                  padding: "16px 40px", borderRadius: 10,
                  fontSize: 16, fontWeight: 700, textDecoration: "none",
                  boxShadow: "0 8px 32px rgba(232,160,32,0.35)",
                }}
              >
                Εγγραφή ως Γραφείο
                <ArrowRight style={{ width: 18, height: 18 }} />
              </a>
              <a
                href="/register/partner"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "transparent", color: "white",
                  border: "2px solid rgba(255,255,255,0.35)",
                  padding: "16px 40px", borderRadius: 10,
                  fontSize: 16, fontWeight: 600, textDecoration: "none",
                }}
              >
                Εγγραφή ως Συνεργάτης
                <ArrowRight style={{ width: 18, height: 18 }} />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#0D1F33", color: "rgba(255,255,255,0.35)" }}>
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="font-display text-xl font-bold text-white mb-1">
                Cretan<span style={{ color: "#E8A020" }}>Desk</span>
              </div>
              <p style={{ fontSize: 13 }}>Crete&apos;s B2B Experience Marketplace</p>
            </div>
            <div style={{ display: "flex", gap: 28, fontSize: 14 }}>
              {[
                { href: "/login",            label: "Σύνδεση" },
                { href: "/register/agency",  label: "Γραφεία" },
                { href: "/register/partner", label: "Πάροχοι" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s" }}
                  className="hover:!text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: 36, paddingTop: 24, textAlign: "center", fontSize: 12 }}>
            © {new Date().getFullYear()} CretanDesk. Όλα τα δικαιώματα διατηρούνται.
          </div>
        </div>
      </footer>
    </div>
  );
}
