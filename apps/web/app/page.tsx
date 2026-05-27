"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import { TypingEffect } from "./components/TypingEffect";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

interface ToolButtonProps {
  icon: string;
  label: string;
  active?: boolean;
}

interface Tool {
  icon: string;
  label: string;
}

interface Stat {
  value: string;
  label: string;
}

interface SyncBar {
  width: string;
  duration: string;
  containerWidth: string;
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Reusable Components ──────────────────────────────────────────────────────

function GlassCard({ children, className = "", hover = false }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, borderColor: "rgba(210,187,255,0.3)" } : {}}
      transition={{ duration: 0.2 }}
      className={`bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ToolButton({ icon, label, active = false }: ToolButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      title={label}
      className={`p-2.5 rounded-xl flex items-center justify-center transition-colors duration-200 ${
        active
          ? "bg-violet-600/80 text-white shadow-[0_0_12px_rgba(210,187,255,0.3)]"
          : "text-white/40 hover:text-white/80 hover:bg-white/10"
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </motion.button>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Preview", href: "#preview" },
  { name: "Tech", href: "#tech" },
  { name: "Stats", href: "#stats" },
];
  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-4 left-0 right-0 z-50 mx-4 md:mx-auto md:max-w-5xl rounded-full px-5 py-3 flex justify-between items-center transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 shadow-2xl"
            : "bg-white/[0.06] backdrop-blur-xl border border-white/10"
        }`}
      >
        {/* Logo */}
        <span className="font-semibold text-white tracking-tighter text-lg">
          EtherealCanvas
        </span>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-7 items-center">
          {navLinks.map((item, i) => (
            <a
              key={item.name}
              href={item.href}
              className="text-white/50 hover:text-white"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex gap-3 items-center">
  <a
    href="/signin"
    className="text-sm text-white/50 hover:text-white transition-colors"
  >
    Sign In
  </a>

  <motion.a
    href="/signup"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className="
      inline-flex items-center gap-2
      bg-white
      text-black
      text-sm
      font-medium
      px-5 py-2.5
      rounded-2xl
      transition-all duration-300
      hover:bg-white/90
    "
  >
    Sign Up

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </svg>
  </motion.a>
</div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white/70 p-1"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-4 right-4 z-40 bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4"
          >
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-white/70 hover:text-white text-sm py-1"
              >
                {item.name}
              </a>
            ))}
            <div className="border-t border-white/10 pt-4 flex gap-3">
  <a
    href="/signin"
    className="text-sm text-white/50 hover:text-white"
  >
    Sign In
  </a>

  <a
    href="/signup"
    className="
      bg-white
      text-black
      text-sm
      font-medium
      px-4 py-2
      rounded-2xl
      hover:bg-white/90
      transition-all
    "
  >
    Sign Up
  </a>
</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Side Toolbar ─────────────────────────────────────────────────────────────

function SideToolbar() {
  const tools: Tool[] = [
   
  ];

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-3 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-2 p-2 bg-[#111]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl"
    >
      <div className="flex flex-col gap-1">
      
      </div>
      <div className="border-t border-white/10 pt-2 flex flex-col items-center gap-1">
        <span className="text-[10px] text-violet-400/50 font-medium tracking-wider">
          V1.0
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-1 text-white/30 hover:text-white/70 transition-colors"
          aria-label="Layers"
        >
          <span className="material-symbols-outlined text-[20px]">layers</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-24 px-5 text-center overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>

        {/* Headline */}
       <motion.h1
  variants={fadeUp}
  initial="hidden"
  animate="visible"
  custom={1}
  className="
    font-clash
    text-5xl
    sm:text-7xl
    md:text-8xl
    lg:text-[110px]
    font-semibold
    tracking-[-0.08em]
    leading-[0.92]
    text-white
    max-w-6xl
    mx-auto
  "
>
  Sketch the future
  <br />

  <span
    className="
    
    "
  >
    <TypingEffect text='in real-time' />
  </span>
</motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-base sm:text-lg text-white/40 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          The precision of a technical tool meets the fluidity of a creative suite.
          The most advanced whiteboard engine ever built for architects and product teams.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-20"
        >
          <motion.button
  whileHover={{
    scale: 1.03,
    y: -2,
    boxShadow: "0 0 40px rgba(255,255,255,0.08)",
  }}
  whileTap={{ scale: 0.98 }}
  className="
    group
    inline-flex items-center gap-2
    px-7 py-3.5
    bg-white
    text-black
    font-medium
    rounded-2xl
    border border-white/10
    transition-all duration-300
    hover:bg-white/90
  "
>
  Start Drawing

  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12h14m-6-6 6 6-6 6"
    />
  </svg>
</motion.button>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="relative w-full max-w-5xl mx-auto"
        >
          <GlassCard className="overflow-hidden p-1 shadow-2xl">
            <motion.img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcOoBIvPYUTjpyQYEhKNZfZennNx5xRcg_T92bbWtyW8rF_YhNE9s0uQA02gD3F8OigjYXOfoBzqVFGXLhRzaNstDEVTpbOgn3kX2bLkus2YXG77syQMtv5r0JX-KeWQ4M6LzMLLAO1yDf39cem9fDmWtxYMdNXW9WIAe6LEjanAtlGiJZtu9828ADECrmVOwiXjuSTnoadDSZQy-avU7Ty7JE3I-fHiEcTeQi_o4aE3vDtW5CGpNQ41POovvOVVAjAXNjX2sdLQA"
              alt="EtherealCanvas Interface"
              whileHover={{ filter: "grayscale(0%)", scale: 1.01 }}
              initial={{ filter: "grayscale(60%)" }}
              animate={{ filter: "grayscale(20%)" }}
              transition={{ duration: 0.6 }}
              className="w-full h-auto rounded-xl opacity-80"
            />
          </GlassCard>
        </motion.div>
    </section>
  );
}

// ─── Features Bento ───────────────────────────────────────────────────────────

function Features() {
  const avatars: string[] = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBtKY4EkhSI7Mh82P4heThzP9snpC_VFe5E6pVbgeaQNwqbOVVe8paFPv_4U7ybaaCSnNueA2Oq8riSJCAPQkRs3tlP5CfkY7fmBfOut8uX5QuqAGxo23YqQs5P4TpU5If8o62opI8RbG3nTnPRqTEyBn8xHlKu5L-3EI-H3iJ5ToUMz7t8L7k4hq-03JOH2DgJDjWPaeEVMOg5q5lAxzbSOSfaysiGM5KKmpajsIACLFOqn6e0WhuMJFRhMjqYFd_wyhGkercjOEw",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDVPwGtqYHeavlCUE4v1fi7ZuMulRqNinVJ5BFRGbCfy-gQD3JRZMXa5OEF_3rfnCyieSSnkohV_JFCLLfKiuwUe32edc0soAZ6685kKsy5DKpElD5XUwkpgvqTK00Uxo-n8fIWZIPQdCfhdeeGDzOh7STS3CbhywnDOhQLIySVXI1zCBdfNE_EUSyDoQiWuAuyvKFuALswLf9Hl9-GgsrxSVFgsJYgW11OV2hmXBJTpPUliIbGdbknPpIGiSksmYoddGNaaxPmwu4",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA504iHJQUr04mhdC-QK9XtAXa4cctlLqhUENwLq_IGJ80P4zOumGLvqMjPOP_BpERTCQX80hx38mf2xdO9qBUxs-0kUDDCTNpwbhC5YEGEblYV6j2gBVicS7NxVHIG7H8uCJs_a_Btc40pCKNlvoFQSbWwU8cJaxE3irQbpT7N9tsxnLUvR-qGawshJDWrcWiJ6cVbAEI4VlCDAQEaELg1QajG2jO0Uv709la2FfOjQwCCjDXOKAgDsLvH6l0c9EOk9H_Jp69Y5tQ",
  ];

  const syncBars: SyncBar[] = [
    { width: "w-1/3", duration: "2", containerWidth: "w-full" },
    { width: "w-1/4", duration: "1.5", containerWidth: "w-2/3" },
    { width: "w-1/2", duration: "3", containerWidth: "w-full" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-5 mb-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 md:grid-cols-12 gap-4"
      >
        {/* Collaboration card */}
        <motion.div
          variants={fadeUp}
          custom={0}
          className="md:col-span-8 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-5">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs text-violet-300 font-medium tracking-widest uppercase">
                Collaborative
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">
              Real-time collaboration
            </h3>
            <p className="text-sm text-white/40 max-w-md leading-relaxed">
              Multi-user editing with sub-100ms latency. Watch your team&apos;s ideas
              converge into reality as if you were in the same room.
            </p>
            <div className="flex -space-x-3 mt-8">
              {avatars.map((src, i) => (
                <motion.img
                  key={i}
                  whileHover={{ y: -4, zIndex: 10 }}
                  src={src}
                  alt={`Team member ${i + 1}`}
                  className="w-11 h-11 rounded-full border-2 border-[#0a0a0a] relative"
                  style={{ zIndex: avatars.length - i }}
                />
              ))}
              <div className="w-11 h-11 rounded-full border-2 border-[#0a0a0a] bg-white/10 flex items-center justify-center text-xs font-semibold text-white/60">
                +12
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-l from-violet-500/20 to-transparent" />
          </div>
        </motion.div>

        {/* Infinite Canvas */}
        <motion.div
          variants={fadeUp}
          custom={1}
          className="md:col-span-4 bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/30 transition-colors duration-300 rounded-2xl p-7 group cursor-default flex flex-col justify-between"
        >
          <div>
            <span className="material-symbols-outlined text-violet-400 text-4xl mb-5 block">
              grid_view
            </span>
            <h3 className="text-lg font-semibold text-white mb-2">Infinite canvas</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Never run out of space. A boundless environment for boundless ideas.
            </p>
          </div>
          <div
            className="mt-6 h-20 w-full rounded-xl border border-white/[0.06] group-hover:scale-105 transition-transform duration-300"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        </motion.div>

        {/* Shape Recognition */}
        <motion.div
          variants={fadeUp}
          custom={2}
          className="md:col-span-4 bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/30 transition-colors duration-300 rounded-2xl p-7 cursor-default"
        >
          <span className="material-symbols-outlined text-violet-400 text-4xl mb-5 block">
            auto_fix_high
          </span>
          <h3 className="text-lg font-semibold text-white mb-2">Shape recognition</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            Rough sketches instantly transformed into perfect vectors with
            AI-assisted detection.
          </p>
        </motion.div>

        {/* Low-latency sync */}
        <motion.div
          variants={fadeUp}
          custom={3}
          className="md:col-span-8 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 h-full">
            <div className="max-w-xs flex-shrink-0">
              <span className="material-symbols-outlined text-violet-400 text-4xl mb-5 block">
                sync
              </span>
              <h3 className="text-lg font-semibold text-white mb-2">Low-latency sync</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Every stroke backed up in real-time across all clusters.
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-3 w-full sm:ml-8 opacity-60">
              {syncBars.map((bar, i) => (
                <div
                  key={i}
                  className={`h-1 bg-violet-500/15 rounded-full overflow-hidden ${bar.containerWidth}`}
                >
                  <motion.div
                    className={`h-full bg-violet-400 rounded-full ${bar.width}`}
                    animate={{ x: ["0%", "300%"] }}
                    transition={{
                      duration: parseFloat(bar.duration),
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Interactive Preview ──────────────────────────────────────────────────────

function InteractivePreview() {
  const checkItems: string[] = [
    "Export to SVG / PNG / JSON",
    "Custom Library Support",
    "End-to-end Encryption",
  ];

  const tabs: string[] = ["Design", "Assets", "Chat"];

  const windowDots: string[] = [
    "bg-red-500/50",
    "bg-yellow-500/50",
    "bg-green-500/50",
  ];

  return (
    <section className="max-w-7xl mx-auto px-5 mb-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="bg-[#0d0d0d] border border-white/[0.06] rounded-3xl overflow-hidden relative"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="relative z-10 p-8 md:p-14">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left copy */}
            <motion.div variants={fadeUp} custom={0} className="lg:w-1/3">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white mb-5 leading-tight">
                Engineered for focus.
              </h2>
              <p className="text-sm text-white/40 leading-relaxed mb-8">
                A minimalist UI that stays out of your way. Every tool is a keyboard
                shortcut away, designed for the &quot;flow state.&quot;
              </p>
              <ul className="space-y-3.5">
                {checkItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-violet-300">
                    <span className="material-symbols-outlined text-sm text-violet-400">
                      check_circle
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right — mock editor */}
            <motion.div variants={scaleIn} className="lg:w-2/3 w-full">
              <GlassCard className="p-5 w-full shadow-2xl">
                {/* Window chrome */}
                <div className="flex justify-between items-center mb-5">
                  <div className="flex gap-2">
                    {windowDots.map((c, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${c}`} />
                    ))}
                  </div>
                  <div className="px-3 py-1 bg-white/[0.05] rounded-full text-[11px] font-mono text-white/40">
                    system_design.canvas
                  </div>
                </div>

                {/* Canvas area */}
                <div className="h-64 sm:h-80 w-full relative border border-white/[0.06] rounded-xl p-4 overflow-hidden">
                  <svg
                    className="w-full h-full text-violet-400"
                    viewBox="0 0 400 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="10" y="10" width="100" height="60" rx="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                    <rect x="150" y="10" width="100" height="60" rx="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M110 40H150" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    <circle cx="200" cy="150" r="35" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="300" y="60" width="80" height="50" rx="8" stroke="rgba(255,183,132,0.6)" strokeWidth="1.5" />
                    <path d="M260 40 Q280 40 280 85 Q280 130 300 135" stroke="rgba(255,183,132,0.4)" strokeWidth="1" />
                    <defs>
                      <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
                      </marker>
                    </defs>
                  </svg>

                  {/* Cursor — Alex */}
                  <motion.div
                    animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/3 flex flex-col items-start"
                  >
                    <span className="material-symbols-outlined text-orange-400 text-xl">
                      near_me
                    </span>
                    <div className="bg-orange-400 text-black px-2 py-0.5 rounded text-[10px] mt-0.5 font-bold">
                      Alex
                    </div>
                  </motion.div>

                  {/* Cursor — Sarah */}
                  <motion.div
                    animate={{ x: [0, -8, 4, 0], y: [0, 6, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/3 right-1/4 flex flex-col items-start"
                  >
                    <span className="material-symbols-outlined text-violet-300 text-xl">
                      near_me
                    </span>
                    <div className="bg-violet-500 text-white px-2 py-0.5 rounded text-[10px] mt-0.5 font-bold">
                      Sarah
                    </div>
                  </motion.div>
                </div>

                {/* Tab bar */}
                <div className="mt-5 flex justify-center">
                  <div className="bg-white/[0.04] p-1 rounded-full border border-white/[0.08] flex gap-1">
                    {tabs.map((tab, i) => (
                      <button
                        key={tab}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          i === 0
                            ? "bg-violet-600 text-white"
                            : "text-white/40 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Marquee ─────────────────────────────────────────────────────────────────

function TechMarquee() {
  const items: string[] = [
    "Next.js",
    "Tailwind CSS",
    "Framer Motion",
    "PostgreSQL",
    "Socket.io",
    "TypeScript",
  ];

  return (
    <section className="mb-32 overflow-hidden py-10">
      <p className="text-center text-xs text-white/25 mb-10 uppercase tracking-[0.2em]">
        Built with precision technology
      </p>
      <div className="relative flex">
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="text-3xl sm:text-4xl font-semibold text-white/10 hover:text-white/60 transition-colors duration-300 cursor-default"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const stats: Stat[] = [
    { value: "10M+", label: "Shapes created monthly by creators" },
    { value: "50k+", label: "Active teams scaling their vision" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-5 mb-32">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.value}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
          >
            <GlassCard className="p-12 text-center" hover>
              <div className="text-6xl sm:text-7xl font-semibold text-violet-300 mb-3 tracking-tighter">
                {s.value}
              </div>
              <div className="text-sm text-white/40">{s.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="max-w-3xl mx-auto px-5 text-center mb-40">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-5xl sm:text-6xl font-semibold tracking-tighter text-white mb-7 leading-tight">
          Ready to evolve?
        </h2>
        <p className="text-base text-white/40 mb-12 leading-relaxed max-w-lg mx-auto">
          Join the thousands of teams using EtherealCanvas to map out the next
          generation of digital products.
        </p>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(167,139,250,0.4)" }}
          whileTap={{ scale: 0.97 }}
          className="px-12 py-5 bg-white text-black hover:bg-violet-400  font-semibold rounded-lg transition-colors duration-200"
        >
          Get Started for Free
        </motion.button>
      </motion.div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const footerLinks: string[] = ["Privacy", "Terms", "Github", "Status"];

  return (
    <footer className="border-t border-white/[0.06] py-8 px-5 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0a0a0a]">
      <span className="text-2xl font-semibold text-white tracking-tighter">
        EtherealCanvas
      </span>
      <span className="text-sm text-white/30">
        © 2026 EtherealCanvas. Precision in every pixel.
      </span>
      <div className="flex gap-6">
        {footerLinks.map((link) => (
          <a
            key={link}
            href="#"
            className="text-sm text-white/30 hover:text-white transition-colors"
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EtherealCanvasPage() {
  return (
    <>
      {/* Google Fonts + Material Symbols — add these to your layout.tsx instead */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
      />

      <div
        className="min-h-screen text-white"
        style={{
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Navbar />
        <SideToolbar />
        <main>
          <Hero />
          <Features />
          <InteractivePreview />
          <TechMarquee />
          <Stats />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  );
}