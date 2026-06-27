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
import { useCandidateStore } from "@/lib/store/candidateStore";

export default function PipelineDetailPage() {
  const params = useParams();
  const pipelineId = typeof params.id === "string" ? params.id : null;

  // Add this state at the top with other states
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scoredCandidates, setScoredCandidates] = useState<any[]>([]);
  const addCandidate = useCandidateStore((s) => s.addCandidate);

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

  const handleScoreCandidate = async () => {
    if (!candidateName || !candidateProfile) return;
    setSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/score`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidate: {
              id: `cand-${Date.now()}`,
              name: candidateName,
              profile: candidateProfile,
            },
            jobSpec: (livePipeline as any)?.jobSpec,
          }),
        },
      );
      const result = await res.json();

      const newCandidate = {
        ...result,
        id: `cand-${Date.now()}`,
        name: candidateName,
        email: candidateEmail,
        stage: "sourced" as const,
        pipelineId: pipelineId ?? "",
        jobTitle: (livePipeline as any)?.jobSpec?.title ?? "Unknown",
      };

      addCandidate(newCandidate);
      setScoredCandidates((prev) => [...prev, newCandidate]);
      setCandidateName("");
      setCandidateEmail("");
      setCandidateProfile("");
      setShowAddCandidate(false);
    } catch {
      console.error("Scoring failed");
    } finally {
      setSubmitting(false);
    }
  };

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

          {((livePipeline as any)?.requiresHumanApproval ||
            pipeline?.requiresHumanApproval) && (
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
        {/* Candidate Scoring Section */}
        {(livePipeline as any)?.currentStage === "sourcing" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-border-main bg-bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Sourcing Agent — Score Candidates
                </h3>
                <p className="mono text-xs text-text-muted mt-0.5">
                  Submit candidate profiles for AI scoring
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddCandidate(!showAddCandidate)}
                className="px-3 py-1.5 rounded-lg bg-accent text-white
                   text-xs font-medium border-0 cursor-pointer"
              >
                + Add Candidate
              </motion.button>
            </div>

            {/* Add candidate form */}
            {showAddCandidate && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-xl border border-border-main bg-bg-secondary"
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="mono text-xs text-text-muted mb-1 block">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. Amara Osei"
                      className="w-full px-3 py-2 rounded-lg border border-border-main
                         bg-bg-card text-text-primary text-sm outline-none
                         focus:border-accent transition-colors placeholder:text-text-muted"
                    />
                  </div>
                  <div>
                    <label className="mono text-xs text-text-muted mb-1 block">
                      Email
                    </label>
                    <input
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="amara@email.com"
                      className="w-full px-3 py-2 rounded-lg border border-border-main
                         bg-bg-card text-text-primary text-sm outline-none
                         focus:border-accent transition-colors placeholder:text-text-muted"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="mono text-xs text-text-muted mb-1 block">
                    Candidate profile / CV summary
                  </label>
                  <textarea
                    value={candidateProfile}
                    onChange={(e) => setCandidateProfile(e.target.value)}
                    placeholder="Senior engineer with 6 years experience in React, Node.js and AWS. Led a team of 8 engineers at Paystack. Built microservices handling 10M requests/day..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-border-main
                       bg-bg-card text-text-primary text-sm outline-none
                       focus:border-accent transition-colors resize-none
                       placeholder:text-text-muted mono"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScoreCandidate}
                  disabled={submitting || !candidateName || !candidateProfile}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent
                     text-white text-xs font-medium border-0 cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "Scoring..." : "Score with Sourcing Agent"}
                </motion.button>
              </motion.div>
            )}

            {/* Scored candidates */}
            {scoredCandidates.length > 0 && (
              <div className="space-y-3">
                {scoredCandidates.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl border border-border-main bg-bg-secondary"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {c.name}
                        </p>
                        <p className="mono text-xs text-text-muted">
                          {c.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent">
                          {c.score}
                        </p>
                        <p className="mono text-xs text-text-muted">/ 100</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.score}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{
                            background:
                              c.score >= 80
                                ? "#10B981"
                                : c.score >= 60
                                  ? "#F59E0B"
                                  : "#EF4444",
                          }}
                        />
                      </div>
                    </div>

                    {c.strengths?.length > 0 && (
                      <div className="mb-2">
                        <p className="mono text-xs text-accent mb-1">
                          Strengths
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.strengths.map((s: string, j: number) => (
                            <span
                              key={j}
                              className="mono text-xs px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: "rgba(16,185,129,0.1)",
                                color: "#10B981",
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {c.reasoningTrace?.length > 0 && (
                      <div>
                        <p className="mono text-xs text-text-muted mb-1">
                          Reasoning trace
                        </p>
                        {c.reasoningTrace
                          .slice(0, 3)
                          .map((line: string, j: number) => (
                            <p
                              key={j}
                              className="mono text-xs text-text-secondary"
                            >
                              {">"} {line}
                            </p>
                          ))}
                      </div>
                    )}

                    <div className="mt-2">
                      <span
                        className="mono text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            c.recommendation === "strong_yes"
                              ? "rgba(16,185,129,0.1)"
                              : c.recommendation === "yes"
                                ? "rgba(6,182,212,0.1)"
                                : "rgba(245,158,11,0.1)",
                          color:
                            c.recommendation === "strong_yes"
                              ? "#10B981"
                              : c.recommendation === "yes"
                                ? "#06B6D4"
                                : "#F59E0B",
                        }}
                      >
                        {c.recommendation?.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Reasoning trace */}
      {selectedAgent && (
        <ReasoningTrace
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* Approval modal */}
      {showApproval && (
        <ApprovalModal
          pipeline={{
            ...((livePipeline as any) ?? pipeline),
            id: pipelineId ?? "",
            jobTitle:
              (livePipeline as any)?.jobSpec?.title ??
              pipeline?.jobTitle ??
              "Pipeline",
            company: pipeline?.company ?? "",
            candidates: pipeline?.candidates ?? [],
            agents: pipeline?.agents ?? [],
            status: "active",
            createdAt: new Date().toISOString(),
            currentAgentId: "coordinator",
            requiresHumanApproval: true,
            marketIntelligence: (livePipeline as any)?.marketIntelligence,
          }}
          onClose={() => setShowApproval(false)}
        />
      )}
    </div>
  );
}
