import { motion } from "framer-motion";
import { Link } from "wouter";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  Search,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Wifi,
  TrendingUp,
  Instagram,
  Youtube,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Animation Variants
   ────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

/* ──────────────────────────────────────────────────────────────
   Static Data
   ────────────────────────────────────────────────────────────── */

const platforms = [
  {
    id: "listings",
    title: "Housing",
    tagline: "Your next home, verified.",
    description: "Find student-ready apartments and shared spaces across Kenya's urban hubs. Every listing is verified, every landlord is rated, and every booking is secure.",
    highlights: [
      { label: "Verified", detail: "Every listing" },
      { label: "Fast", detail: "Quick responses" },
      { label: "Protected", detail: "Secure bookings" },
    ],
    image: "/Apartment-Heroimage.webp",
    features: ["Verified listings", "Instant tours", "Secure booking"],
    href: "/housing",
  },
  {
    id: "marketplace",
    title: "Marketplace",
    tagline: "Buy. Sell. Trust.",
    description: "The only marketplace built for students. From furniture to electronics, every seller is verified and every transaction is protected by our trust system.",
    highlights: [
      { label: "Trusted", detail: "Verified sellers" },
      { label: "Safe", detail: "Campus meetups" },
      { label: "Chat", detail: "Before buying" },
    ],
    image: "/marketplace.png",
    features: ["Trusted sellers", "Campus delivery", "Safe transactions"],
    href: "/marketplace",
  },
  {
    id: "budgetbite",
    title: "Budget Bite",
    tagline: "Eat well, spend less.",
    description: "Discover affordable meals tailored to your budget and schedule. Search by cost, cooking time, and dietary needs — because eating well shouldn't break the bank.",
    highlights: [
      { label: "Budget", detail: "Cost-focused" },
      { label: "Quick", detail: "Fast recipes" },
      { label: "Healthy", detail: "Balanced meals" },
    ],
    image: "/budgetbite.png",
    features: ["Budget-first meals", "Quick recipes", "Student-friendly"],
    href: "/budget-bite",
  },
];

/* ──────────────────────────────────────────────────────────────
   Landing Page
   ────────────────────────────────────────────────────────────── */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary overflow-x-hidden">

      {/* ── NAVIGATION ──────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-border">
        <div className="landing-container h-16 flex items-center justify-between">

          {/* Wordmark */}
          <Link href="/" aria-label="Homelink home" className="shrink-0 flex items-center gap-2">
            <img src="/logo.svg" alt="Homelink" className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight leading-none">
              <span className="text-accent">home</span>
              <span className="text-text-primary">link</span>
              <span className="text-accent">.ke</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium">
            <a href="#listings" className="text-text-secondary hover:text-text-primary transition-colors">
              Listings
            </a>
            <a href="#marketplace" className="text-text-secondary hover:text-text-primary transition-colors">
              Marketplace
            </a>
            <a href="#community" className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5">
              Community
              <Badge variant="accent" size="sm">Beta</Badge>
            </a>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-text-primary hover:text-white">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button
                size="md"
                className="h-10 rounded-xl px-6 font-bold text-white border border-white/10 bg-gradient-to-r from-accent via-accent-purple to-accent-green shadow-xl shadow-accent/30 hover:brightness-110 hover:shadow-accent/45 transition-all duration-300"
              >
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">

        {/* Ambient background glows */}
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,163,224,0.22) 0%, transparent 65%)", transform: "translate(35%, -35%)", zIndex: 0 }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)", transform: "translate(-30%, 30%)", zIndex: 0 }}
        />

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,163,224,0.22) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            maskImage: "radial-gradient(ellipse 70% 70% at 60% 40%, black 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 60% 40%, black 20%, transparent 100%)",
            zIndex: 0,
          }}
        />

        {/* Floating logo accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-20 right-10 lg:top-32 lg:right-20 w-32 h-32 lg:w-40 lg:h-40 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <img src="/logo.svg" alt="" className="w-full h-full opacity-30" />
        </motion.div>

        {/* Mobile hero background image */}
        <div className="absolute inset-0 sm:hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-base/45 via-bg-base/72 to-bg-base/95" />
        </div>

        <div className="landing-container relative z-10 w-full grid lg:grid-cols-2 gap-12 lg:gap-24 lg:pr-12 items-center py-20 lg:py-28">

          {/* ── LEFT: Copy ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="accent" size="md" dot className="mb-6 inline-flex">
                <Sparkles className="w-3 h-3 mr-1.5" />
                2.0 Beta Access Open
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-display font-bold text-text-primary leading-[1.08] mb-6"
            >
              <div className="whitespace-nowrap">Your <span className="text-accent">home</span>.</div>
              <div className="whitespace-nowrap">Your <span className="text-gradient">community</span>.</div>
              <div className="whitespace-nowrap">Your <span className="text-accent-green">ecosystem</span>.</div>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-text-secondary text-lg leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0"
            >
              Homelink is an ecosystem for modern living — helping you find homes, connect with community, explore the marketplace, and manage everyday life all in one place.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col xs:flex-row gap-3 justify-center lg:justify-start"
            >
              <Link href="/signup" className="w-full xs:w-auto">
                <Button size="lg" iconRight={<ArrowRight className="w-4 h-4" />} className="w-full xs:w-auto shadow-xl shadow-accent/30 font-bold px-8 h-14 rounded-2xl text-base">
                  Get started
                </Button>
              </Link>
              <Button
                size="lg"
                variant="secondary"
                icon={<Search className="w-4 h-4" />}
                className="w-full xs:w-auto h-14 rounded-2xl px-8 text-base font-bold border border-accent/30 bg-bg-surface/70 hover:bg-bg-hover/80 hover:border-accent/50 transition-all"
              >
                Explore Homes
              </Button>
            </motion.div>

            {/* Social proof row */}
          </motion.div>

          {/* ── RIGHT: Property card stack ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.25 }}
            className="relative h-[460px] lg:h-[540px] hidden sm:block"
          >
            {/* Back card (tilted offset) */}
            <div className="absolute top-6 right-0 left-10 bottom-0 rounded-[2rem] overflow-hidden border border-border/40 opacity-50 rotate-[3deg] scale-95">
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=700&auto=format&fit=crop"
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-base/70 via-bg-base/10 to-transparent" />
            </div>

            {/* Front card */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden border border-border shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop"
                alt="Modern apartment"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/10 to-transparent" />

              {/* Top badges */}
              <div className="absolute top-5 left-5 flex flex-col gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-md" style={{ background: "var(--color-accent)" }}>
                  Verified Listing
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-md border border-white/20" style={{ background: "rgba(255,255,255,0.10)" }}>
                  <Wifi className="w-3 h-3" /> Wi-Fi Enabled
                </span>
              </div>

              {/* Bottom action button */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                <button className="flex-1 bg-white text-[#0A0E27] font-bold rounded-2xl h-12 text-sm tracking-wide hover:bg-white/92 active:bg-white/80 active:scale-[0.99] transition-all cursor-pointer">
                  View Availability
                </button>
              </div>
            </div>

            {/* Floating stat chip */}
            <motion.div
              initial={{ opacity: 0, x: -12, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
              className="absolute -left-4 top-[38%] glass border border-border rounded-2xl px-4 py-3 shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent-muted flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="text-caption font-bold text-text-primary leading-none">New</div>
                  <div className="text-[0.625rem] text-text-tertiary mt-0.5">listings this week</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── PLATFORMS SHOWCASE ──────────────────────────────────── */}
      {platforms.map((platform, idx) => (
        <section
          key={platform.id}
          id={platform.id}
          className="relative min-h-screen flex items-center py-20 overflow-hidden"
          style={{ background: idx % 2 === 0 ? "rgba(17,22,56,0.2)" : "transparent" }}
        >
          {/* Ambient gradient - using different color per platform */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: idx === 0 
                ? "radial-gradient(circle at 20% 50%, rgba(0,163,224,0.15), transparent 60%)"
                : idx === 1
                ? "radial-gradient(circle at 80% 50%, rgba(139,92,246,0.15), transparent 60%)"
                : "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15), transparent 60%)",
            }}
          />

          <div className="landing-container relative z-10">
            <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Image side */}
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`relative ${idx % 2 === 1 ? 'lg:order-2' : ''}`}
              >
                <div className="relative rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl group">
                  <img
                    src={platform.image}
                    alt={platform.title}
                    className="w-full h-[500px] lg:h-[600px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent opacity-60" />
                  
                  {/* Floating glass card */}
                  <div 
                    className="absolute bottom-6 left-6 right-6 rounded-2xl p-6 border border-white/10"
                    style={{
                      background: "rgba(10, 13, 30, 0.75)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {platform.features.map((feature, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 border border-white/10"
                          style={{ background: "rgba(255,255,255,0.08)" }}
                        >
                          <CheckCircle2 className="w-3 h-3 text-accent" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Content side */}
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 0 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={idx % 2 === 1 ? 'lg:order-1' : ''}
              >
                <div className="space-y-8">
                  {/* Logo accent */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-12 h-12 opacity-50"
                  >
                    <img src="/logo.svg" alt="" className="w-full h-full" />
                  </motion.div>

                  {/* Title & tagline */}
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <h2 className="text-[3.5rem] lg:text-[4.5rem] font-bold text-text-primary leading-[0.95] mb-4 tracking-tight">
                        {platform.title}
                      </h2>
                      <p className="text-2xl lg:text-3xl text-text-secondary font-light leading-tight mb-6">
                        {platform.tagline}
                      </p>
                    </motion.div>
                  </div>

                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
                      {platform.description}
                    </p>
                  </motion.div>

                  {/* Highlights */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="grid grid-cols-3 gap-4"
                  >
                    {platform.highlights.map((stat, i) => {
                      const colors = [
                        { text: "text-accent", bg: "bg-accent/10" },
                        { text: "text-accent-purple", bg: "bg-accent-purple/10" },
                        { text: "text-accent-green", bg: "bg-accent-green/10" },
                      ];
                      const color = colors[i % 3];
                      return (
                        <div key={i} className="text-center lg:text-left">
                          <div className={`text-2xl lg:text-3xl font-bold ${color.text} mb-1`}>
                            {stat.label}
                          </div>
                          <div className="text-sm text-text-tertiary uppercase tracking-wide">
                            {stat.detail}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Link href={platform.href}>
                      <Button
                        size="lg"
                        iconRight={<ArrowRight className="w-5 h-5" />}
                        className={`h-14 rounded-2xl px-8 text-base font-bold shadow-2xl hover:scale-[1.02] transition-all duration-300 ${
                          platform.id === 'listings'
                            ? 'bg-accent hover:bg-accent-hover shadow-accent/40 hover:shadow-accent/60'
                            : platform.id === 'marketplace'
                            ? 'bg-accent-purple hover:brightness-110 shadow-accent-purple/40 hover:shadow-accent-purple/60'
                            : 'bg-accent-green hover:brightness-110 shadow-accent-green/40 hover:shadow-accent-green/60'
                        }`}
                      >
                        Explore {platform.title}
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* ── COMMUNITY ───────────────────────────────────────────── */}
      <section id="community" className="relative min-h-screen flex items-center py-20 overflow-hidden" style={{ background: "rgba(17,22,56,0.3)" }}>
        {/* Radial gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(0,163,224,0.1), transparent 70%)",
          }}
        />

        <div className="landing-container relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <Badge variant="accent" size="md" className="mb-6">Launching Soon</Badge>
              <h2 className="text-[3rem] lg:text-[4.5rem] font-bold text-text-primary leading-[1.05] mb-6 tracking-tight">
                Community &{" "}
                <span className="text-gradient">Budget Bite</span>
              </h2>
              <p className="text-lg lg:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Stay connected. Discover local events, campus updates, and budget-friendly meals — all in one place.
              </p>
            </motion.div>

            {/* Two simple cards */}
            <div className="grid lg:grid-cols-2 gap-10 mb-20">
              {/* Community Feed Card */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group"
              >
                <div
                  className="rounded-[2.5rem] border border-white/8 p-10 lg:p-12 h-full hover:border-accent/30 transition-all duration-500"
                  style={{
                    background: "rgba(10, 13, 30, 0.5)",
                    backdropFilter: "blur(12px) saturate(120%)",
                    WebkitBackdropFilter: "blur(12px) saturate(120%)",
                  }}
                >
                  {/* Icon container */}
                  <div className="mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-500"
                      style={{ background: "linear-gradient(135deg, var(--color-accent-muted) 0%, rgba(0,163,224,0.08) 100%)" }}
                    >
                      <MessageSquare className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-text-primary leading-tight mb-2">Community Feed</h3>
                      <p className="text-sm font-medium text-accent uppercase tracking-widest">What's happening nearby</p>
                    </div>
                    
                    <p className="text-base lg:text-lg text-text-secondary leading-relaxed pt-4">
                      Stay in the loop with local events, campus announcements, and neighborhood updates from your community.
                    </p>

                    {/* Accent line */}
                    <div className="pt-6">
                      <div className="h-0.5 w-12 bg-gradient-to-r from-accent to-transparent"></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Budget Bite Card */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group"
              >
                <div
                  className="rounded-[2.5rem] border p-10 lg:p-12 h-full overflow-hidden transition-all duration-500 hover:border-accent-green/40"
                  style={{
                    borderColor: "rgba(16,185,129,0.25)",
                    background: "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(10,13,30,0.5) 100%)",
                    backdropFilter: "blur(12px) saturate(120%)",
                    WebkitBackdropFilter: "blur(12px) saturate(120%)",
                  }}
                >
                  {/* NEW Badge */}
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute top-5 right-5 z-10"
                  >
                    <Badge variant="accent" size="sm" className="bg-accent-green font-semibold">NEW</Badge>
                  </motion.div>

                  {/* Icon container */}
                  <div className="mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-accent-green group-hover:scale-110 transition-transform duration-500"
                      style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)" }}
                    >
                      <Sparkles className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-text-primary leading-tight mb-2">Budget Bite</h3>
                      <p className="text-sm font-medium text-accent-green uppercase tracking-widest">Eat well, spend less</p>
                    </div>
                    
                    <p className="text-base lg:text-lg text-text-secondary leading-relaxed pt-4">
                      Discover budget-friendly recipes, quick meals, and food discoveries from fellow students — launching soon.
                    </p>

                    {/* Accent line */}
                    <div className="pt-6">
                      <div className="h-0.5 w-12 bg-gradient-to-r from-accent-green to-transparent"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Minimal footer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center"
            >
              <Link href="/signup">
                <Button size="lg" iconRight={<ArrowRight className="w-5 h-5 text-[#0A0E27]" />} className="h-14 rounded-2xl px-10 font-bold text-base bg-white !text-[#0A0E27] hover:bg-white/92 active:bg-white/80 active:scale-[0.99] shadow-2xl transition-all">
                  Get Early Access
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="relative border-t border-border/30 pt-20 pb-16" style={{ background: "linear-gradient(180deg, rgba(10,13,30,0.5) 0%, rgba(10,13,30,0.9) 100%)" }}>
        <div className="landing-container">
          {/* Top Section: Brand + Meru Tech Hub */}
          <div className="mb-16">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-16">
              {/* Homelink Brand */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-8 flex items-center gap-3">
                  <img src="/logo.svg" alt="Homelink" className="w-10 h-10" />
                  <span className="font-bold text-3xl tracking-tight">
                    <span className="text-accent">home</span>
                    <span className="text-text-primary">link</span>
                    <span className="text-accent">.ke</span>
                  </span>
                </div>
                <p className="text-lg text-text-secondary max-w-sm leading-relaxed mb-2">
                  Student life, unified.
                </p>
                <p className="text-base text-text-tertiary max-w-sm mb-8">
                  Housing, marketplace, and meals in one platform. Built for students in Kenya.
                </p>
              </motion.div>

              {/* Meru Tech Hub - Ownership */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-sm text-accent-green font-medium uppercase tracking-widest mb-3">Owned & Built By</p>
                <h3 className="text-2xl lg:text-3xl font-bold text-text-primary mb-3">Meru Tech Hub</h3>
                <p className="text-base text-text-secondary mb-4 leading-relaxed">
                  Empowering innovation in Meru. Creating digital products that matter.
                </p>
                <a
                  href="https://merutechhub.co.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent-green font-semibold hover:text-accent-green/80 transition-colors"
                >
                  Visit merutechhub.co.ke
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/30" />
          </div>

          {/* Middle Section: Product & Company Links */}
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            {/* Product */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h4 className="text-sm font-bold text-text-primary mb-6 uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: "Housing", href: "/housing" },
                  { label: "Marketplace", href: "/marketplace" },
                  { label: "Budget Bite", href: "/budget-bite" },
                  { label: "Community", href: "/community" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href}>
                      <a className="text-sm text-text-secondary hover:text-accent transition-colors">
                        {l.label}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <h4 className="text-sm font-bold text-text-primary mb-6 uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                {["About Us", "Blog", "Contact", "Careers"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-sm font-bold text-text-primary mb-6 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "Sitemap"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bottom Section: Copyright & Social */}
          <div className="border-t border-border/30 pt-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
              <div>
                <p className="text-xs text-text-tertiary leading-relaxed">
                  © {new Date().getFullYear()} Homelink, a product of{" "}
                  <a
                    href="https://merutechhub.co.ke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-green hover:text-accent-green/80 font-semibold transition-colors"
                  >
                    Meru Tech Hub
                  </a>
                  . All rights reserved.
                </p>
                <p className="text-xs text-text-tertiary mt-2">Powering student life across Kenya 🇰🇪</p>
              </div>

              {/* Social */}
              <div className="flex gap-4">
                <a
                  href="#"
                  title="Twitter"
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/40 transition-all"
                >
                  <span className="text-lg">𝕏</span>
                </a>
                <a
                  href="https://instagram.com/merutech.innovationhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/40 transition-all"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://youtube.com/@MeruTechInnovationHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="YouTube"
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/40 transition-all"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default LandingPage;