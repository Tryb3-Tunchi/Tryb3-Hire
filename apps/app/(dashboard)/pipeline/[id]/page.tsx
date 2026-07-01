"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePipelinePolling } from "@/lib/hooks/usePipelinePolling";
import ReasoningTrace from "@/components/pipeline/ReasoningTrace";
import ApprovalModal from "@/components/pipeline/ApprovalModal";
import { useCandidateStore } from "@/lib/store/candidateStore";
import { Agent } from "@/lib/types";
import {
  ArrowLeft,
  AlertCircle,
  Loader,
  CheckCircle,
  Clock,
  Circle,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";

const AGENT_ORDER = [
  { id: "intake", name: "Intake Agent", description: "Parses job description" },
  {
    id: "market",
    name: "Market Agent",
    description: "Researches talent market",
  },
  { id: "sourcing", name: "Sourcing Agent", description: "Scores candidates" },
  {
    id: "screening",
    name: "Screening Agent",
    description: "Interviews candidates",
  },
  {
    id: "conflict",
    name: "Conflict Agent",
    description: "Resolves disagreements",
  },
  {
    id: "coordinator",
    name: "Coordinator",
    description: "Orchestrates pipeline",
  },
];

const stageIndex: Record<string, number> = {
  intake: 0,
  market: 1,
  sourcing: 2,
  screening: 3,
  conflict: 4,
  completed: 5,
};

function AgentCard({
  agentDef,
  status,
  onClick,
  isSelected,
}: {
  agentDef: { id: string; name: string; description: string };
  status: "completed" | "running" | "idle" | "waiting";
  onClick: () => void;
  isSelected: boolean;
}) {
  const configs = {
    completed: {
      color: "#10B981",
      icon: CheckCircle,
      label: "Done",
      pulse: false,
    },
    running: { color: "#06B6D4", icon: Loader, label: "Running", pulse: true },
    waiting: {
      color: "#F59E0B",
      icon: UserCheck,
      label: "Waiting",
      pulse: true,
    },
    idle: { color: "#2A3347", icon: Circle, label: "Pending", pulse: false },
  };
  const config = configs[status];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer p-3 
                 rounded-xl border transition-all"
      style={{
        backgroundColor: isSelected
          ? `${config.color}10`
          : "var(--color-bg-secondary)",
        borderColor: isSelected ? config.color : "var(--color-border)",
      }}
    >
      {/* Icon circle */}
      <motion.div
        animate={
          config.pulse
            ? {
                boxShadow: [
                  `0 0 0px ${config.color}30`,
                  `0 0 16px ${config.color}80`,
                  `0 0 0px ${config.color}30`,
                ],
              }
            : {}
        }
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-12 h-12 rounded-full flex items-center justify-center border-2"
        style={{
          backgroundColor: `${config.color}15`,
          borderColor: `${config.color}50`,
        }}
      >
        <motion.div
          animate={status === "running" ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Icon size={20} color={config.color} />
        </motion.div>
      </motion.div>

      {/* Name */}
      <p
        className="text-xs font-medium text-center leading-tight"
        style={{
          color: status === "idle" ? "#4B5563" : "var(--color-text-primary)",
        }}
      >
        {agentDef.name.replace(" Agent", "")}
      </p>

      {/* Status badge */}
      <span
        className="mono text-[10px] px-2 py-0.5 rounded-full"
        style={{
          color: config.color,
          backgroundColor: `${config.color}15`,
        }}
      >
        {config.label}
      </span>
    </motion.div>
  );
}

export default function PipelineDetailPage() {
  const params = useParams();
  const pipelineId = typeof params.id === "string" ? params.id : null;
  const { pipeline: livePipeline, loading } = usePipelinePolling(pipelineId);

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showApproval, setShowApproval] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateProfile, setCandidateProfile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scoredCandidates, setScoredCandidates] = useState<any[]>([]);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(
    null,
  );

  const addCandidate = useCandidateStore((s) => s.addCandidate);

  const lp = livePipeline as any;
  const currentStage = lp?.currentStage ?? "intake";
  const currentIndex = stageIndex[currentStage] ?? 0;
  const jobTitle = lp?.jobSpec?.title ?? "New Pipeline";
  const coordinatorLog: string[] = lp?.log ?? [];
  const requiresApproval = lp?.requiresHumanApproval ?? false;
  const marketData = lp?.marketIntelligence;

  // Determine each agent's status
  const getAgentStatus = (agentId: string) => {
    const agentStageMap: Record<string, string> = {
      intake: "intake",
      market: "market",
      sourcing: "sourcing",
      screening: "screening",
      conflict: "conflict",
      coordinator: "coordinator",
    };

    const agentStage = agentStageMap[agentId];
    const agentIdx = stageIndex[agentStage] ?? 0;
    const currentIdx = stageIndex[currentStage] ?? 0;

    // Coordinator is special — always active
    if (agentId === "coordinator") {
      if (currentStage === "completed") return "completed";
      return "running";
    }

    if (agentIdx < currentIdx) return "completed";
    if (agentId === currentStage) {
      return requiresApproval ? "waiting" : "running";
    }
    return "idle";
  };

  const handleScoreCandidate = async () => {
    if (!candidateName.trim() || !candidateProfile.trim()) return;
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
            jobSpec: lp?.jobSpec,
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
        jobTitle: lp?.jobSpec?.title ?? "Unknown",
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

  if (!lp && !loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted mono text-sm">Pipeline not found</p>
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
            {jobTitle}
          </h1>
          <p className="mono text-xs text-text-muted mt-1 capitalize">
            Stage: {currentStage} · {coordinatorLog.length} log entries
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Agent Pipeline Cards */}
      <div className="rounded-xl border border-border-main bg-bg-card p-6 mb-4">
        <p className="mono text-xs text-text-muted mb-5">
          Click any agent to view its activity
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {AGENT_ORDER.map((agentDef) => (
            <AgentCard
              key={agentDef.id}
              agentDef={agentDef}
              status={getAgentStatus(agentDef.id)}
              onClick={() =>
                setSelectedAgent(
                  selectedAgent === agentDef.id ? null : agentDef.id,
                )
              }
              isSelected={selectedAgent === agentDef.id}
            />
          ))}
        </div>

        {/* Agent detail slide panel */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="rounded-xl border border-border-main bg-bg-secondary p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-text-primary">
                    {AGENT_ORDER.find((a) => a.id === selectedAgent)?.name}
                  </p>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="cursor-pointer"
                  >
                    <X size={14} color="#4B5563" />
                  </button>
                </div>

                <p className="mono text-xs text-text-muted mb-3">
                  {AGENT_ORDER.find((a) => a.id === selectedAgent)?.description}
                </p>

                {/* Show relevant data per agent */}
                {selectedAgent === "intake" && lp?.jobSpec && (
                  <div className="space-y-2">
                    <p className="mono text-xs text-accent">
                      Role: {lp.jobSpec.title} ({lp.jobSpec.seniority})
                    </p>
                    <p className="mono text-xs text-text-secondary">
                      Skills: {lp.jobSpec.requiredSkills?.join(", ")}
                    </p>
                    <p className="mono text-xs text-text-secondary">
                      Experience: {lp.jobSpec.experienceYears} years
                    </p>
                  </div>
                )}

                {selectedAgent === "market" && marketData && (
                  <div className="space-y-2">
                    <p className="mono text-xs text-accent">
                      Salary: ${marketData.salaryRange?.min?.toLocaleString()} —
                      ${marketData.salaryRange?.max?.toLocaleString()} USD
                    </p>
                    <p className="mono text-xs text-text-secondary">
                      Supply: {marketData.talentSupply} · Time to hire:{" "}
                      {marketData.averageTimeToHire}
                    </p>
                    <p className="mono text-xs text-text-secondary">
                      {marketData.marketSummary}
                    </p>
                  </div>
                )}

                {selectedAgent === "sourcing" && (
                  <p className="mono text-xs text-text-muted">
                    {scoredCandidates.length > 0
                      ? `${scoredCandidates.length} candidates scored`
                      : "Add candidates below to score them"}
                  </p>
                )}

                {/* Coordinator log for other agents */}
                {["screening", "conflict", "coordinator"].includes(
                  selectedAgent,
                ) && (
                  <div className="space-y-1">
                    {coordinatorLog
                      .filter((l) => l.toLowerCase().includes(selectedAgent))
                      .slice(-3)
                      .map((line, i) => (
                        <p key={i} className="mono text-xs text-text-secondary">
                          {">"} {line}
                        </p>
                      ))}
                    {coordinatorLog.filter((l) =>
                      l.toLowerCase().includes(selectedAgent),
                    ).length === 0 && (
                      <p className="mono text-xs text-text-muted">
                        Not yet activated
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Coordinator Log */}
      {coordinatorLog.length > 0 && (
        <div className="rounded-xl border border-border-main bg-bg-card p-5 mb-4">
          <p className="mono text-xs text-text-muted mb-3">Coordinator log</p>
          <div className="space-y-1.5">
            {coordinatorLog.map((line, i) => (
              <div key={i} className="flex gap-2">
                <span className="mono text-[10px] text-text-muted w-4 flex-shrink-0">
                  {i + 1}
                </span>
                <span
                  className="mono text-xs"
                  style={{
                    color:
                      line.includes("complete") || line.includes("✓")
                        ? "#10B981"
                        : line.includes("failed") || line.includes("Error")
                          ? "#EF4444"
                          : line.includes("Human:")
                            ? "#F59E0B"
                            : "#94A3B8",
                  }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Scoring — only show in sourcing stage */}
      {currentStage === "sourcing" && (
        <div className="rounded-xl border border-border-main bg-bg-card p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Sourcing Agent — Candidate Scoring
              </h3>
              <p className="mono text-xs text-text-muted mt-0.5">
                Paste a candidate CV summary for AI scoring against this job
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddCandidate(!showAddCandidate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-accent text-white text-xs font-medium
                         border-0 cursor-pointer"
            >
              <Plus size={12} />
              Add candidate
            </motion.button>
          </div>

          {/* Add form */}
          <AnimatePresence>
            {showAddCandidate && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-4 rounded-xl border border-border-main bg-bg-secondary"
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="mono text-xs text-text-muted mb-1.5 block">
                      Full name *
                    </label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. Amara Osei"
                      className="w-full px-3 py-2 rounded-lg border border-border-main
                                 bg-bg-card text-text-primary text-sm outline-none
                                 focus:border-accent transition-colors
                                 placeholder:text-text-muted"
                    />
                  </div>
                  <div>
                    <label className="mono text-xs text-text-muted mb-1.5 block">
                      Email
                    </label>
                    <input
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="amara@email.com"
                      className="w-full px-3 py-2 rounded-lg border border-border-main
                                 bg-bg-card text-text-primary text-sm outline-none
                                 focus:border-accent transition-colors
                                 placeholder:text-text-muted"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mono text-xs text-text-muted mb-1.5 block">
                    CV summary / profile *
                  </label>
                  <textarea
                    value={candidateProfile}
                    onChange={(e) => setCandidateProfile(e.target.value)}
                    placeholder="e.g. Senior engineer with 6 years in React and Node.js. Led team of 8 at Paystack. Built microservices handling 10M requests/day. AWS certified. Strong CI/CD with GitHub Actions..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-border-main
                               bg-bg-card text-text-primary text-sm outline-none
                               focus:border-accent transition-colors resize-none
                               placeholder:text-text-muted mono"
                  />
                  <p className="mono text-xs text-text-muted mt-1">
                    {candidateProfile.length} chars — be specific about skills
                    and experience
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleScoreCandidate}
                    disabled={
                      submitting ||
                      !candidateName.trim() ||
                      !candidateProfile.trim()
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg
                               bg-accent text-white text-xs font-medium
                               border-0 cursor-pointer disabled:opacity-40
                               disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Loader size={12} />
                        </motion.div>
                        Scoring with Qwen...
                      </>
                    ) : (
                      "Score with Sourcing Agent"
                    )}
                  </motion.button>
                  <button
                    onClick={() => setShowAddCandidate(false)}
                    className="px-3 py-2 rounded-lg border border-border-main
                               text-text-muted text-xs cursor-pointer
                               hover:bg-bg-hover transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scored candidates */}
          {scoredCandidates.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-20
                            border border-border-main rounded-xl border-dashed"
            >
              <p className="mono text-xs text-text-muted">
                No candidates scored yet — click Add candidate above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scoredCandidates.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border-main bg-bg-secondary overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer
                               hover:bg-bg-hover transition-colors"
                    onClick={() =>
                      setExpandedCandidate(
                        expandedCandidate === c.id ? null : c.id,
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center
                                   text-xs font-semibold"
                        style={{
                          backgroundColor:
                            c.score >= 80
                              ? "rgba(16,185,129,0.15)"
                              : "rgba(245,158,11,0.15)",
                          color: c.score >= 80 ? "#10B981" : "#F59E0B",
                        }}
                      >
                        {c.name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {c.name}
                        </p>
                        <p className="mono text-xs text-text-muted">
                          {c.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className="text-xl font-bold"
                          style={{
                            color: c.score >= 80 ? "#10B981" : "#F59E0B",
                          }}
                        >
                          {c.score}
                        </p>
                        <p className="mono text-[10px] text-text-muted">
                          / 100
                        </p>
                      </div>
                      <span
                        className="mono text-xs px-2 py-0.5 rounded"
                        style={{
                          color:
                            c.recommendation === "strong_yes"
                              ? "#10B981"
                              : "#F59E0B",
                          backgroundColor:
                            c.recommendation === "strong_yes"
                              ? "rgba(16,185,129,0.1)"
                              : "rgba(245,158,11,0.1)",
                        }}
                      >
                        {c.recommendation?.replace("_", " ").toUpperCase()}
                      </span>
                      {expandedCandidate === c.id ? (
                        <ChevronUp size={14} color="#4B5563" />
                      ) : (
                        <ChevronDown size={14} color="#4B5563" />
                      )}
                    </div>
                  </div>

                  {/* Expanded trace */}
                  <AnimatePresence>
                    {expandedCandidate === c.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-border-main"
                      >
                        <div className="p-4 space-y-3">
                          {/* Score bar */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="mono text-xs text-text-muted">
                                Match score
                              </span>
                              <span className="mono text-xs text-text-muted">
                                Confidence: {c.confidence}%
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${c.score}%` }}
                                className="h-full rounded-full"
                                style={{
                                  background:
                                    c.score >= 80
                                      ? "linear-gradient(90deg,#059669,#10B981)"
                                      : "linear-gradient(90deg,#D97706,#F59E0B)",
                                }}
                              />
                            </div>
                          </div>

                          {/* Strengths */}
                          {c.strengths?.length > 0 && (
                            <div>
                              <p className="mono text-xs text-accent mb-1.5">
                                Strengths
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {c.strengths.map((s: string, j: number) => (
                                  <span
                                    key={j}
                                    className="mono text-xs px-2 py-0.5 rounded"
                                    style={{
                                      backgroundColor: "rgba(16,185,129,0.08)",
                                      color: "#10B981",
                                    }}
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Gaps */}
                          {c.gaps?.length > 0 && (
                            <div>
                              <p
                                className="mono text-xs mb-1.5"
                                style={{ color: "#EF4444" }}
                              >
                                Gaps
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {c.gaps.map((g: string, j: number) => (
                                  <span
                                    key={j}
                                    className="mono text-xs px-2 py-0.5 rounded"
                                    style={{
                                      backgroundColor: "rgba(239,68,68,0.08)",
                                      color: "#EF4444",
                                    }}
                                  >
                                    {g}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reasoning trace */}
                          {c.reasoningTrace?.length > 0 && (
                            <div>
                              <p className="mono text-xs text-text-muted mb-1.5">
                                Reasoning trace
                              </p>
                              <div className="space-y-1">
                                {c.reasoningTrace.map(
                                  (line: string, j: number) => (
                                    <div key={j} className="flex gap-2">
                                      <span className="mono text-[10px] text-text-muted w-4">
                                        {j + 1}
                                      </span>
                                      <span className="mono text-xs text-text-secondary">
                                        {">"} {line}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Proceed to screening */}
      {currentStage === "sourcing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 rounded-xl border border-border-main bg-bg-secondary"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {scoredCandidates.length === 0
                  ? "No candidates scored yet"
                  : `${scoredCandidates.length} candidate(s) scored`}
              </p>
              <p className="mono text-xs text-text-muted mt-0.5">
                {scoredCandidates.length === 0
                  ? "Add at least one candidate before proceeding"
                  : "Ready to proceed to screening phase"}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: scoredCandidates.length > 0 ? 1.02 : 1 }}
              whileTap={{ scale: scoredCandidates.length > 0 ? 0.98 : 1 }}
              onClick={async () => {
                if (scoredCandidates.length === 0) return;

                // Save all candidates to backend first
                for (const candidate of scoredCandidates) {
                  await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/${pipelineId}/candidates`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(candidate),
                    },
                  );
                }

                // Then approve
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/${pipelineId}/approve`,
                  { method: "POST" },
                );

                const data = await res.json();

                if (!res.ok) {
                  alert(data.error);
                  return;
                }

                window.location.href = `/candidates`;
              }}
              disabled={scoredCandidates.length === 0}
              className="px-4 py-2 rounded-lg text-xs font-medium border-0
                   cursor-pointer transition-all"
              style={{
                backgroundColor:
                  scoredCandidates.length > 0
                    ? "var(--color-accent)"
                    : "var(--color-border)",
                color:
                  scoredCandidates.length > 0
                    ? "#fff"
                    : "var(--color-text-muted)",
                cursor:
                  scoredCandidates.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              {scoredCandidates.length === 0
                ? "Add candidates first"
                : "Approve shortlist → Screening"}
            </motion.button>
          </div>

          {/* Conflict warning */}
          {scoredCandidates.some((c: any) => c.score < 70) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-3 rounded-lg border mono text-xs"
              style={{
                borderColor: "rgba(245,158,11,0.3)",
                backgroundColor: "rgba(245,158,11,0.05)",
                color: "#F59E0B",
              }}
            >
              ⚠ Conflict Agent will review borderline candidates automatically
            </motion.div>
          )}
        </motion.div>
      )}

      {/* After scoring — navigate hint */}
      {scoredCandidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center justify-between p-3 rounded-lg
               border border-border-main bg-bg-card"
        >
          <p className="mono text-xs text-text-muted">
            {scoredCandidates.length} candidate(s) ready for screening
          </p>

          <a
            href="/candidates"
            className="mono text-xs text-accent hover:underline cursor-pointer"
          >
            Go to Candidates page →
          </a>
        </motion.div>
      )}

      {/* Show what's next */}
      {scoredCandidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-4 rounded-xl border border-dashed border-border-main"
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock size={13} color="#F59E0B" />
            <p className="text-xs font-medium text-text-primary">
              Next: Screening Agent
            </p>
          </div>
          <p className="mono text-xs text-text-muted">
            Once you proceed, the Screening Agent will be ready to conduct
            multi-turn conversations with scored candidates on the Candidates
            page.
          </p>
        </motion.div>
      )}

      {/* Approval Modal */}
      {showApproval && lp && (
        <ApprovalModal
          pipeline={{
            ...lp,
            id: pipelineId ?? "",
            jobTitle: lp?.jobSpec?.title ?? "Pipeline",
            company: "",
            candidates: [],
            agents: [],
            status: "active",
            createdAt: new Date().toISOString(),
            currentAgentId: "coordinator",
            requiresHumanApproval: true,
            marketIntelligence: lp?.marketIntelligence,
          }}
          onClose={() => setShowApproval(false)}
        />
      )}
    </div>
  );
}
