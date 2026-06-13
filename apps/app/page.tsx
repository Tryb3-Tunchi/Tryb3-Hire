"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ParticleNetwork from "@/components/landing/ParticleNetwork";
import AgentShowcase from "@/components/landing/AgentShowcase";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowRight, Zap } from "lucide-react";

const stats = [
  { label: "Agents deployed", value: "6" },
  { label: "Avg time to shortlist", value: "< 4min" },
  { label: "Human checkpoints", value: "3" },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-primary">
      <ParticleNetwork />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-12 h-[60px] border-b border-main bg-primary">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accent-muted border border-main flex items-center justify-center">
            <Zap size={13} className="text-accent" />
          </div>
          <span className="font-semibold text-[15px] text-primary">TryB3</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-3 py-1.5 rounded-md border border-main bg-transparent 
                       text-secondary text-[13px] cursor-pointer hover:bg-card 
                       transition-colors font-inter"
          >
            Sign in
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-12 pt-24 pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                     border border-main bg-card mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="mono text-xs text-secondary">
            Powered by Qwen Cloud · Alibaba Cloud
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-[clamp(2.8rem,7vw,5rem)] font-bold leading-[1.1] 
                     tracking-[-0.03em] text-primary mb-5"
        >
          Hiring, handled by <br />
          <span className="text-accent">six intelligent agents</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[17px] text-secondary leading-relaxed 
                     max-w-[540px] mx-auto mb-10"
        >
          TryB3 deploys a coordinated multi-agent system that handles your
          entire recruitment pipeline — from intake to offer — with full audit
          trails and human approval at every critical step.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg 
                       bg-accent text-white text-[14px] font-medium 
                       cursor-pointer border-0"
          >
            Start a hiring request <ArrowRight size={14} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 rounded-lg border border-main bg-card 
                       text-secondary text-[14px] font-medium cursor-pointer"
          >
            View live demo
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="flex justify-center gap-12 mt-16 pt-10 
                     border-t border-main flex-wrap"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-semibold text-primary">
                {s.value}
              </div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Agent showcase */}
      <AgentShowcase />

      {/* Bottom CTA */}
      <section
        className="relative z-10 max-w-4xl mx-auto px-12 py-20 
                          text-center border-t border-main"
      >
        <h2 className="text-[2rem] font-bold text-primary tracking-tight mb-3">
          Ready to hire smarter?
        </h2>
        <p className="text-secondary mb-8 text-[15px]">
          Let the agents handle the complexity. You make the final call.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg 
                     bg-accent text-white text-[14px] font-medium cursor-pointer border-0"
        >
          Get started <ArrowRight size={14} />
        </motion.button>
      </section>
    </main>
  );
}
