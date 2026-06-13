"use client";

import { motion } from "framer-motion";

const agents = [
  {
    num: "01",
    name: "Intake Agent",
    desc: "Parses job requirements from email, PDF, or plain text into a structured hiring spec.",
    dot: "bg-accent",
  },
  {
    num: "02",
    name: "Market Agent",
    desc: "Researches salary benchmarks, skill demand trends, and competitor signals before sourcing.",
    dot: "bg-cyan",
  },
  {
    num: "03",
    name: "Sourcing Agent",
    desc: "Scores candidates against the spec with a full reasoning trace — the why, not just the score.",
    dot: "bg-violet",
  },
  {
    num: "04",
    name: "Screening Agent",
    desc: "Conducts async multi-turn screening with persistent memory across sessions.",
    dot: "bg-violet",
  },
  {
    num: "05",
    name: "Conflict Agent",
    desc: "Mediates disagreements between agents. Every decision logged with full audit trail.",
    dot: "bg-amber",
  },
  {
    num: "06",
    name: "Coordinator",
    desc: "Orchestrates all agents. Decomposes tasks, resolves conflicts, escalates to humans.",
    dot: "bg-accent",
  },
];

export default function AgentShowcase() {
  return (
    <section className="relative z-10 max-w-4xl mx-auto px-12 pb-24">
      <div className="mb-10">
        <p className="mono text-xs text-accent tracking-widest uppercase mb-2">
          The system
        </p>
        <h2 className="text-[1.75rem] font-bold text-primary tracking-tight">
          Six agents, one pipeline
        </h2>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                      border border-main rounded-xl overflow-hidden 
                      divide-x divide-y divide-[var(--color-border)]"
      >
        {agents.map((agent, i) => (
          <motion.div
            key={agent.num}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="p-6 bg-card hover:bg-hover transition-colors cursor-default"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="mono text-[11px] text-muted">{agent.num}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${agent.dot}`} />
            </div>
            <h3 className="text-[14px] font-semibold text-primary mb-2">
              {agent.name}
            </h3>
            <p className="text-[13px] text-secondary leading-relaxed">
              {agent.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
