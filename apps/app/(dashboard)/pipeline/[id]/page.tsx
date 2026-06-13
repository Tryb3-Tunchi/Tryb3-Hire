"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { mockPipelines } from "@/lib/mockData";
import AgentPipeline from "@/components/pipeline/AgentPipeline";
import ReasoningTrace from "@/components/pipeline/ReasoningTrace";
import ApprovalModal from "@/components/pipeline/ApprovalModal";
import { Agent } from "@/lib/types";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PipelineDetailPage() {
  const { id } = useParams();
  const pipeline = mockPipelines.find(p => p.id === id);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showApproval, setShowApproval] = useState(
    pipeline?.requiresHumanApproval ?? false
  );

  if (!pipeline) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted mono text-sm">Pipeline not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Back + Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted 
                     hover:text-text-secondary transition-colors mb-4 mono"
        >
          <ArrowLeft size={12} /> back to dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {pipeline.jobTitle}
            </h1>
            <p className="text-sm text-text-muted mt-1">{pipeline.company}</p>
          </div>

          {pipeline.requiresHumanApproval && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowApproval(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border
                         cursor-pointer text-xs font-medium"
              style={{
                backgroundColor: "rgba(245,158,11,0.08)",
                borderColor: "rgba(245,158,11,0.25)",
                color: "#F59E0B",
              }}
            >
              <AlertCircle size={13} />
              Action required
            </motion.button>
          )}
        </div>
      </div>

      {/* Agent Pipeline */}
      <div className="rounded-xl border border-border-main bg-bg-card p-6 mb-4">
        <p className="mono text-xs text-text-muted mb-5">
          Click any agent to view its reasoning trace
        </p>
        <AgentPipeline
          agents={pipeline.agents}
          onSelectAgent={setSelectedAgent}
          selectedAgentId={selectedAgent?.id ?? null}
        />
      </div>

      {/* Current task info */}
      {selectedAgent && selectedAgent.currentTask && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border-main bg-bg-card p-4 mb-4"
        >
          <p className="mono text-xs text-text-muted mb-1">Current task</p>
          <p className="text-sm text-text-primary">{selectedAgent.currentTask}</p>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Candidates sourced", value: pipeline.candidates.length },
          {
            label: "Agents completed",
            value: pipeline.agents.filter(a => a.status === "completed").length,
          },
          {
            label: "Flagged candidates",
            value: pipeline.candidates.filter(c => c.flagged).length,
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl border border-border-main bg-bg-card p-4"
          >
            <p className="text-xl font-semibold text-text-primary">
              {stat.value}
            </p>
            <p className="mono text-xs text-text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Reasoning Trace Drawer */}
      {selectedAgent && (
        <ReasoningTrace
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* Approval Modal */}
      {showApproval && (
        <ApprovalModal
          pipeline={pipeline}
          onClose={() => setShowApproval(false)}
        />
      )}
    </div>
  );
}