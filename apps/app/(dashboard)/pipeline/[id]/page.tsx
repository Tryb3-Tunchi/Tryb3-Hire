"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
// import { usePipelinePolling } from "@/lib/hooks/usePipelinePolling";
import {
  usePipelinePolling,
  LivePipelineState,
} from "@/lib/hooks/usePipelinePolling";
import AgentPipeline from "@/components/pipeline/AgentPipeline";
import ReasoningTrace from "@/components/pipeline/ReasoningTrace";
import ApprovalModal from "@/components/pipeline/ApprovalModal";
import { Agent, Pipeline } from "@/lib/types";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";
import Link from "next/link";
import { mockPipelines } from "@/lib/mockData";

export default function PipelineDetailPage() {
  const params = useParams();
  const pipelineId = typeof params.id === "string" ? params.id : null;

  const { pipeline: livePipeline, loading } = usePipelinePolling(pipelineId);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showApproval, setShowApproval] = useState(false);

  const mockPipeline = mockPipelines.find((p) => p.id === pipelineId) ?? null;
  const pipeline: Pipeline | null = mockPipeline;

  const displayTitle =
    (livePipeline as any)?.jobSpec?.title ??
    pipeline?.jobTitle ??
    "New Pipeline";

  const displayCompany = pipeline?.company ?? "Processing...";

  const coordinatorLog: string[] = (livePipeline as any)?.log ?? [];

  const requiresApproval =
    (livePipeline as any)?.requiresHumanApproval ??
    pipeline?.requiresHumanApproval ??
    false;

  const currentStage =
    (livePipeline as any)?.currentStage ?? pipeline?.currentAgentId ?? "—";

  const candidatesCount = pipeline?.candidates?.length ?? 0;

  const agentsDone =
    pipeline?.agents?.filter((a: Agent) => a.status === "completed").length ??
    0;

  if (!pipeline && !livePipeline) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader size={16} className="text-text-muted animate-spin" />
          <p className="text-text-muted mono text-sm">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted
                   hover:text-text-secondary transition-colors mb-6 mono"
      >
        <ArrowLeft size={12} /> back to dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-sm text-text-muted mt-1">{displayCompany}</p>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-accent"
              />
              <span className="mono text-xs text-accent">Live</span>
            </div>
          )}

          {requiresApproval && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowApproval(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg
                         border cursor-pointer text-xs font-medium"
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
      {pipeline?.agents && (
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
      )}

      {/* Coordinator log */}
      {coordinatorLog.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border-main bg-bg-card p-5 mb-4"
        >
          <p className="mono text-xs text-text-muted mb-3">Coordinator log</p>
          <div className="space-y-1.5">
            {coordinatorLog.map((line: string, i: number) => (
              <div key={i} className="flex gap-2">
                <span className="mono text-[10px] text-text-muted w-4 flex-shrink-0">
                  {i + 1}
                </span>
                <span className="mono text-xs text-text-secondary">{line}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Candidates", value: candidatesCount },
          { label: "Agents done", value: agentsDone },
          { label: "Current stage", value: currentStage },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border-main bg-bg-card p-4"
          >
            <p className="text-xl font-semibold text-text-primary capitalize">
              {stat.value}
            </p>
            <p className="mono text-xs text-text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Reasoning trace */}
      {selectedAgent && (
        <ReasoningTrace
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* Approval modal */}
      {showApproval && pipeline && (
        <ApprovalModal
          pipeline={pipeline}
          onClose={() => setShowApproval(false)}
        />
      )}
    </div>
  );
}
