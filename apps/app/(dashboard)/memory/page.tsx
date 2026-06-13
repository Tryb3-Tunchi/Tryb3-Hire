"use client";

import { motion } from "framer-motion";
import { Brain, Network } from "lucide-react";

const memoryNodes = [
  {
    id: "m1",
    candidate: "Amara Osei",
    memories: 4,
    lastUpdated: "2 hours ago",
    confidence: 92,
  },
  {
    id: "m2",
    candidate: "Yusuf Balogun",
    memories: 2,
    lastUpdated: "5 hours ago",
    confidence: 68,
  },
  {
    id: "m3",
    candidate: "Chinwe Eze",
    memories: 6,
    lastUpdated: "1 day ago",
    confidence: 85,
  },
  {
    id: "m4",
    candidate: "David Okonkwo",
    memories: 3,
    lastUpdated: "2 days ago",
    confidence: 74,
  },
];

export default function MemoryPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Brain size={18} color="#6366F1" />
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Memory Explorer
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Candidate memories accumulated by the Screening Agent across sessions
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Total memory nodes", value: "248" },
          { label: "Candidates tracked", value: "14" },
          { label: "Avg memories per candidate", value: "17" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl border border-border-main bg-bg-card p-4"
          >
            <p className="text-xl font-semibold text-text-primary">{s.value}</p>
            <p className="mono text-xs text-text-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Memory nodes list */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-4">
          <Network size={14} color="#6366F1" />
          <h2 className="text-sm font-semibold text-text-primary">
            Candidate memory nodes
          </h2>
        </div>

        {memoryNodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center justify-between p-4 rounded-xl
                       border border-border-main bg-bg-card hover:bg-bg-hover
                       transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full bg-col-violet/10 border
                              border-col-violet/20 flex items-center justify-center"
              >
                <Brain size={14} color="#6366F1" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {node.candidate}
                </p>
                <p className="mono text-xs text-text-muted">
                  {node.memories} memories · updated {node.lastUpdated}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="mono text-xs text-text-muted mb-1">confidence</p>
                <div className="w-20 h-1 rounded-full bg-bg-secondary">
                  <div
                    className="h-full rounded-full bg-col-violet"
                    style={{ width: `${node.confidence}%` }}
                  />
                </div>
              </div>
              <span className="mono text-xs text-col-violet">
                {node.confidence}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
