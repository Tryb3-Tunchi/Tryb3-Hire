"use client";

import { motion } from "framer-motion";
import { Zap, Brain, Database, Activity } from "lucide-react";

const stats = [
  {
    icon: Zap,
    label: "Active Agents",
    value: "4",
    sub: "across 2 pipelines",
    color: "#00FF94",
  },
  {
    icon: Brain,
    label: "Qwen API",
    value: "Online",
    sub: "12ms avg latency",
    color: "#00D4FF",
  },
  {
    icon: Database,
    label: "Memory Store",
    value: "248 nodes",
    sub: "candidate memories",
    color: "#7C3AED",
  },
  {
    icon: Activity,
    label: "Decisions Made",
    value: "37",
    sub: "this week",
    color: "#FF8C00",
  },
];

export default function SystemHealth() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl p-4 border border-white/5"
          style={{ backgroundColor: "#111827" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <stat.icon size={14} color={stat.color} />
            <span className="text-xs" style={{ color: "#8892A4" }}>
              {stat.label}
            </span>
          </div>
          <p className="font-syne font-bold text-xl"
             style={{ color: "#F0F4FF" }}>
            {stat.value}
          </p>
          <p className="mono text-xs mt-0.5" style={{ color: "#8892A4" }}>
            {stat.sub}
          </p>
        </motion.div>
      ))}
    </div>
  );
}