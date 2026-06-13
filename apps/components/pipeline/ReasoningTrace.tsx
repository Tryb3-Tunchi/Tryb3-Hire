"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X } from "lucide-react";
import { Agent } from "@/lib/types";

interface ReasoningTraceProps {
  agent: Agent | null;
  onClose: () => void;
}

export default function ReasoningTrace({ agent, onClose }: ReasoningTraceProps) {
  if (!agent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed right-0 top-0 h-screen w-96 border-l border-white/10 z-40 p-6 overflow-y-auto"
        style={{ backgroundColor: "#0D1424" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Terminal size={16} color="#00FF94" />
            <span className="font-syne font-semibold text-sm" style={{ color: "#F0F4FF" }}>
              Reasoning Trace
            </span>
          </div>
          <button onClick={onClose}>
            <X size={16} color="#8892A4" />
          </button>
        </div>

        {/* Agent name */}
        <div 
          className="mono text-xs mb-4 px-3 py-2 rounded-lg"
          style={{ backgroundColor: "#111827", color: "#00FF94" }}
        >
          {`> ${agent.name}`}
        </div>

        {/* Trace lines */}
        <div className="space-y-2">
          {agent.reasoningTrace && agent.reasoningTrace.length > 0 ? (
            agent.reasoningTrace.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="mono text-xs leading-relaxed"
                style={{ color: "#8892A4" }}
              >
                <span style={{ color: "#7C3AED" }}>{">"}</span> {line}
              </motion.div>
            ))
          ) : (
            <p className="mono text-xs" style={{ color: "#8892A4" }}>
              No trace available yet. Agent has not run.
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}