"use client";

import { motion } from "framer-motion";
import { Pipeline } from "@/lib/types";
import { useRouter } from "next/navigation";
import { AlertCircle, Users, ArrowRight } from "lucide-react";

interface PipelineCardProps {
  pipeline: Pipeline;
  index: number;
}

export default function PipelineCard({ pipeline, index }: PipelineCardProps) {
  const router = useRouter();
  const activeAgent = pipeline.agents.find(
    a => a.id === pipeline.currentAgentId
  );
  const completedCount = pipeline.agents.filter(
    a => a.status === "completed"
  ).length;
  const progress = (completedCount / pipeline.agents.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      onClick={() => router.push(`/pipeline/${pipeline.id}`)}
      className="rounded-2xl p-5 border border-white/5 cursor-pointer
                 hover:border-white/10 transition-all"
      style={{ backgroundColor: "#111827" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-syne font-semibold"
              style={{ color: "#F0F4FF" }}>
            {pipeline.jobTitle}
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "#8892A4" }}>
            {pipeline.company}
          </p>
        </div>

        {pipeline.requiresHumanApproval && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
               style={{ backgroundColor: "#FF8C0015", border: "1px solid #FF8C0040" }}>
            <AlertCircle size={12} color="#FF8C00" />
            <span className="mono text-xs" style={{ color: "#FF8C00" }}>
              Needs you
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <span className="mono text-xs" style={{ color: "#8892A4" }}>
            Pipeline progress
          </span>
          <span className="mono text-xs" style={{ color: "#00FF94" }}>
            {completedCount}/6 agents
          </span>
        </div>
        <div className="h-1.5 rounded-full w-full"
             style={{ backgroundColor: "#0D1424" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #7C3AED, #00FF94)"
            }}
          />
        </div>
      </div>

      {/* Active agent */}
      {activeAgent && (
        <div className="mb-4 p-3 rounded-xl"
             style={{ backgroundColor: "#0D1424" }}>
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#00D4FF" }}
            />
            <span className="mono text-xs" style={{ color: "#00D4FF" }}>
              {activeAgent.name}
            </span>
          </div>
          <p className="text-xs" style={{ color: "#8892A4" }}>
            {activeAgent.currentTask || "Processing..."}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users size={13} color="#8892A4" />
          <span className="text-xs" style={{ color: "#8892A4" }}>
            {pipeline.candidates.length} candidates
          </span>
        </div>
        <ArrowRight size={14} color="#8892A4" />
      </div>
    </motion.div>
  );
}