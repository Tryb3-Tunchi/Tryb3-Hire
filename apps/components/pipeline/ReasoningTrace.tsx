"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Agent } from "@/lib/types";
import { X, Terminal, CheckCircle, Loader, Clock } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  agent: Agent | null;
  onClose: () => void;
}

const statusConfig = {
  idle: { color: "#4B5563", label: "Idle" },
  running: { color: "#06B6D4", label: "Running" },
  waiting: { color: "#F59E0B", label: "Waiting" },
  completed: { color: "#10B981", label: "Completed" },
  error: { color: "#EF4444", label: "Error" },
  awaiting_human: { color: "#F59E0B", label: "Awaiting approval" },
};

export default function ReasoningTrace({ agent, onClose }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom as new trace lines appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agent?.reasoningTrace?.length]);

  const config = agent ? statusConfig[agent.status] : null;

  return (
    <AnimatePresence>
      {agent && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-screen w-[420px] z-50 flex flex-col
                       border-l border-border-main"
            style={{ backgroundColor: "var(--color-bg-secondary)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 h-[60px]
                            border-b border-border-main flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                <Terminal size={14} color="#10B981" />
                <span className="text-sm font-semibold text-text-primary">
                  Reasoning Trace
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg border border-border-main
                           bg-bg-card flex items-center justify-center cursor-pointer
                           hover:bg-bg-hover transition-colors"
              >
                <X size={13} color="#94A3B8" />
              </button>
            </div>

            {/* Agent info */}
            <div className="px-5 py-4 border-b border-border-main flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-text-primary">
                  {agent.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <motion.div
                    animate={
                      agent.status === "running" ? { opacity: [1, 0.3, 1] } : {}
                    }
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: config?.color }}
                  />
                  <span
                    className="mono text-xs"
                    style={{ color: config?.color }}
                  >
                    {config?.label}
                  </span>
                </div>
              </div>

              {agent.currentTask && (
                <p className="mono text-xs text-text-muted leading-relaxed">
                  {agent.currentTask}
                </p>
              )}
            </div>

            {/* Trace lines */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {agent.reasoningTrace && agent.reasoningTrace.length > 0 ? (
                <>
                  {agent.reasoningTrace.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex gap-2.5"
                    >
                      {/* Line number */}
                      <span
                        className="mono text-[10px] pt-0.5 flex-shrink-0 w-5 text-right"
                        style={{ color: "#2A3347" }}
                      >
                        {i + 1}
                      </span>

                      {/* Arrow */}
                      <span
                        className="mono text-[11px] pt-0.5 flex-shrink-0"
                        style={{ color: "#6366F1" }}
                      >
                        {">"}
                      </span>

                      {/* Content */}
                      <span
                        className="mono text-[12px] leading-relaxed"
                        style={{
                          color: line.startsWith("Scoring")
                            ? "#10B981"
                            : line.startsWith("Reasoning:")
                              ? "#06B6D4"
                              : line.startsWith("Flagging") ||
                                  line.startsWith("Warning")
                                ? "#F59E0B"
                                : "#94A3B8",
                        }}
                      >
                        {line}
                      </span>
                    </motion.div>
                  ))}
                  <div ref={bottomRef} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Clock size={20} color="#2A3347" />
                  <p className="mono text-xs text-text-muted text-center">
                    No trace yet.
                    <br />
                    Agent has not run.
                  </p>
                </div>
              )}
            </div>

            {/* Footer — shows when completed */}
            {agent.status === "completed" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-5 py-4 border-t border-border-main flex-shrink-0
                           flex items-center gap-2"
              >
                <CheckCircle size={14} color="#10B981" />
                <span className="mono text-xs text-accent">
                  Agent completed successfully
                </span>
              </motion.div>
            )}

            {/* Footer — shows when running */}
            {agent.status === "running" && (
              <div
                className="px-5 py-4 border-t border-border-main flex-shrink-0
                              flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Loader size={13} color="#06B6D4" />
                </motion.div>
                <span className="mono text-xs" style={{ color: "#06B6D4" }}>
                  Processing...
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
