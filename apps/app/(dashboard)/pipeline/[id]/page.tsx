"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePipelinePolling } from "@/lib/hooks/usePipelinePolling";
import ApprovalModal from "@/components/pipeline/ApprovalModal";
import { useCandidateStore } from "@/lib/store/candidateStore";
import {
  ArrowLeft,
  AlertCircle,
  Loader,
  CheckCircle,
  Circle,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

// ─── Agent definitions ────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: "intake",
    name: "Intake",
    fullName: "Intake Agent",
    description: "Parses job description into structured spec using Qwen-Max",
  },
  {
    id: "market",
    name: "Market",
    fullName: "Market Intelligence Agent",
    description:
      "Researches salary benchmarks and talent supply using Qwen-Plus",
  },
  {
    id: "sourcing",
    name: "Sourcing",
    fullName: "Sourcing & Scoring Agent",
    description: "Scores candidates against job spec with full reasoning trace",
  },
  {
    id: "screening",
    name: "Screening",
    fullName: "Screening Agent",
    description: "Conducts multi-turn interviews with persistent memory",
  },
  {
    id: "conflict",
    name: "Conflict",
    fullName: "Conflict Resolution Agent",
    description: "Mediates disagreements and flags borderline candidates",
  },
  {
    id: "coordinator",
    name: "Coordinator",
    fullName: "Coordinator Agent",
    description: "Orchestrates all agents and manages pipeline state",
  },
];

// Stage order for progress tracking
const STAGE_ORDER = ["intake", "market", "sourcing", "screening", "completed"];

function getAgentStatus(
  agentId: string,
  currentStage: string,
  requiresApproval: boolean,
  hasConflict: boolean,
): "completed" | "running" | "waiting" | "idle" {
  const stageIdx = STAGE_ORDER.indexOf(currentStage);

  if (agentId === "coordinator") {
    return currentStage === "completed" ? "completed" : "running";
  }

  if (agentId === "conflict") {
    if (currentStage === "completed") return "completed";
    if (
      hasConflict &&
      (currentStage === "screening" || currentStage === "completed")
    )
      return "completed";
    if (hasConflict) return "running";
    return "idle";
  }

  const agentIdx = STAGE_ORDER.indexOf(agentId);

  if (agentIdx < 0) return "idle";
  if (currentStage === "completed") return "completed";
  if (agentIdx < stageIdx) return "completed";
  if (agentId === currentStage) {
    return requiresApproval ? "waiting" : "running";
  }
  return "idle";
}

// ─── Agent Card Component ─────────────────────────────────────────────────────
function AgentCard({
  agent,
  status,
  isSelected,
  onClick,
}: {
  agent: (typeof AGENTS)[0];
  status: "completed" | "running" | "waiting" | "idle";
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = {
    completed: {
      color: "#10B981",
      Icon: CheckCircle,
      label: "Done",
      spin: false,
      pulse: false,
    },
    running: {
      color: "#06B6D4",
      Icon: Loader,
      label: "Running",
      spin: true,
      pulse: true,
    },
    waiting: {
      color: "#F59E0B",
      Icon: UserCheck,
      label: "Needs you",
      spin: false,
      pulse: true,
    },
    idle: {
      color: "#2A3347",
      Icon: Circle,
      label: "Pending",
      spin: false,
      pulse: false,
    },
  }[status];

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border
                 cursor-pointer transition-all"
      style={{
        backgroundColor: isSelected
          ? `${config.color}12`
          : "var(--color-bg-secondary)",
        borderColor: isSelected ? `${config.color}60` : "var(--color-border)",
      }}
    >
      <motion.div
        animate={
          config.pulse
            ? {
                boxShadow: [
                  `0 0 0px ${config.color}00`,
                  `0 0 14px ${config.color}80`,
                  `0 0 0px ${config.color}00`,
                ],
              }
            : {}
        }
        transition={{ duration: 1.8, repeat: Infinity }}
        className="w-11 h-11 rounded-full flex items-center justify-center border-2"
        style={{
          backgroundColor: `${config.color}15`,
          borderColor: `${config.color}50`,
        }}
      >
        <motion.div
          animate={config.spin ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 2,
            repeat: config.spin ? Infinity : 0,
            ease: "linear",
          }}
        >
          <config.Icon size={18} color={config.color} />
        </motion.div>
      </motion.div>

      <p
        className="text-xs font-semibold text-center leading-tight"
        style={{
          color: status === "idle" ? "#4B5563" : "var(--color-text-primary)",
        }}
      >
        {agent.name}
      </p>

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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pipelineId = typeof params.id === "string" ? params.id : null;
  const { pipeline: liveData, loading } = usePipelinePolling(pipelineId);

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
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [markingScreeningDone, setMarkingScreeningDone] = useState(false);

  const addCandidate = useCandidateStore((s) => s.addCandidate);

  const lp = liveData as any;
  const currentStage: string = lp?.currentStage ?? "intake";
  const requiresApproval: boolean = lp?.requiresHumanApproval ?? false;
  const jobTitle: string = lp?.jobSpec?.title ?? "Loading...";
  const log: string[] = lp?.log ?? [];
  const marketData = lp?.marketIntelligence;
  const hasConflict = log.some((l) => l.includes("Conflict Agent"));
  const stageProgress = STAGE_ORDER.indexOf(currentStage);
  const progressPercent = Math.round(
    (Math.max(0, stageProgress) / (STAGE_ORDER.length - 1)) * 100,
  );

  const showToast = (
    msg: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
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
      showToast(`${candidateName} scored ${result.score}/100`, "success");
    } catch {
      showToast("Scoring failed — check your connection", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveShortlist = async () => {
    if (scoredCandidates.length === 0) {
      showToast("Add at least one candidate before approving", "error");
      return;
    }

    showToast("Saving candidates to pipeline...", "info");

    for (const c of scoredCandidates) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/${pipelineId}/candidates`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(c),
        },
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/${pipelineId}/approve`,
      { method: "POST" },
    );
    const data = await res.json();

    if (!res.ok) {
      showToast(data.error, "error");
      return;
    }

    showToast("Shortlist approved — Screening Agent activated", "success");
    setTimeout(() => router.push("/candidates"), 1500);
  };

  const handleMarkScreeningDone = async () => {
    setMarkingScreeningDone(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/${pipelineId}/screening-complete`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error, "error");
        return;
      }
      showToast(
        "Screening marked complete — approve final shortlist",
        "success",
      );
      window.location.reload();
    } catch {
      showToast("Failed — try again", "error");
    } finally {
      setMarkingScreeningDone(false);
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
    <div className="max-w-5xl mx-auto pb-12">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl
                       border shadow-xl max-w-xs"
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderColor:
                toast.type === "error"
                  ? "rgba(239,68,68,0.5)"
                  : toast.type === "success"
                    ? "rgba(16,185,129,0.5)"
                    : "rgba(99,102,241,0.5)",
            }}
          >
            <p
              className="mono text-xs"
              style={{
                color:
                  toast.type === "error"
                    ? "#EF4444"
                    : toast.type === "success"
                      ? "#10B981"
                      : "#6366F1",
              }}
            >
              {toast.msg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
            Stage: {currentStage} · {log.length} log entries
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowApproval(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                         border cursor-pointer text-xs font-semibold"
              style={{
                backgroundColor: "rgba(245,158,11,0.1)",
                borderColor: "rgba(245,158,11,0.4)",
                color: "#F59E0B",
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <AlertCircle size={13} />
              </motion.div>
              Action required
            </motion.button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="mono text-xs text-text-muted">
            Pipeline progress
          </span>
          <span className="mono text-xs text-accent">{progressPercent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #7C3AED, #10B981)" }}
          />
        </div>
      </div>

      {/* Agent Cards */}
      <div className="rounded-xl border border-border-main bg-bg-card p-6 mb-4">
        <p className="mono text-xs text-text-muted mb-4">
          Click any agent card to see what it did
        </p>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {AGENTS.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              status={getAgentStatus(
                agent.id,
                currentStage,
                requiresApproval,
                hasConflict,
              )}
              isSelected={selectedAgent === agent.id}
              onClick={() =>
                setSelectedAgent(selectedAgent === agent.id ? null : agent.id)
              }
            />
          ))}
        </div>

        {/* Agent detail panel */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="rounded-xl border border-border-main bg-bg-secondary p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-text-primary">
                    {AGENTS.find((a) => a.id === selectedAgent)?.fullName}
                  </p>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="cursor-pointer"
                  >
                    <X size={14} color="#4B5563" />
                  </button>
                </div>

                <p className="mono text-xs text-text-muted mb-3">
                  {AGENTS.find((a) => a.id === selectedAgent)?.description}
                </p>

                {/* Intake data */}
                {selectedAgent === "intake" && lp?.jobSpec && (
                  <div className="space-y-2">
                    <p className="mono text-xs" style={{ color: "#10B981" }}>
                      Role: {lp.jobSpec.title} · {lp.jobSpec.seniority} ·{" "}
                      {lp.jobSpec.experienceYears}+ years
                    </p>
                    <p className="mono text-xs text-text-secondary">
                      Required: {lp.jobSpec.requiredSkills?.join(", ")}
                    </p>
                    {lp.jobSpec.responsibilities?.length > 0 && (
                      <p className="mono text-xs text-text-muted">
                        Key duties:{" "}
                        {lp.jobSpec.responsibilities.slice(0, 2).join(" · ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Market data */}
                {selectedAgent === "market" && marketData && (
                  <div className="space-y-2">
                    <p className="mono text-xs" style={{ color: "#06B6D4" }}>
                      Salary: ${marketData.salaryRange?.min?.toLocaleString()} —
                      ${marketData.salaryRange?.max?.toLocaleString()}{" "}
                      {marketData.salaryRange?.currency}
                    </p>
                    <p className="mono text-xs text-text-secondary">
                      Talent supply: {marketData.talentSupply} · Avg hire time:{" "}
                      {marketData.averageTimeToHire}
                    </p>
                    <p className="mono text-xs text-text-secondary">
                      Top competitors: {marketData.topCompetitors?.join(", ")}
                    </p>
                    <p className="mono text-xs text-text-muted mt-1">
                      {marketData.marketSummary}
                    </p>
                  </div>
                )}

                {/* Sourcing data */}
                {selectedAgent === "sourcing" && (
                  <div className="space-y-1">
                    {scoredCandidates.length === 0 ? (
                      <p className="mono text-xs text-text-muted">
                        No candidates scored yet — add candidates below
                      </p>
                    ) : (
                      scoredCandidates.map((c, i) => (
                        <p key={i} className="mono text-xs text-text-secondary">
                          {">"} {c.name} — {c.score}/100 ·{" "}
                          {c.recommendation?.replace("_", " ")}
                        </p>
                      ))
                    )}
                  </div>
                )}

                {/* Conflict data */}
                {selectedAgent === "conflict" && (
                  <div className="space-y-1">
                    {hasConflict ? (
                      log
                        .filter((l) => l.includes("Conflict"))
                        .map((l, i) => (
                          <p
                            key={i}
                            className="mono text-xs text-text-secondary"
                          >
                            {">"} {l}
                          </p>
                        ))
                    ) : (
                      <p className="mono text-xs text-text-muted">
                        No conflicts detected — all candidates scored within
                        normal range
                      </p>
                    )}
                  </div>
                )}

                {/* Screening data */}
                {selectedAgent === "screening" && (
                  <div>
                    {currentStage === "screening" ? (
                      <div className="space-y-2">
                        <p
                          className="mono text-xs"
                          style={{ color: "#6366F1" }}
                        >
                          Active — go to Candidates page to conduct interviews
                        </p>
                        <Link
                          href="/candidates"
                          className="mono text-xs text-accent underline cursor-pointer"
                        >
                          → Open Candidates page
                        </Link>
                      </div>
                    ) : currentStage === "completed" ? (
                      <p className="mono text-xs text-accent">
                        Screening completed — candidates interviewed
                      </p>
                    ) : (
                      <p className="mono text-xs text-text-muted">
                        Activates after sourcing shortlist is approved
                      </p>
                    )}
                  </div>
                )}

                {/* Coordinator data */}
                {selectedAgent === "coordinator" && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {log.slice(-6).map((l, i) => (
                      <p key={i} className="mono text-xs text-text-secondary">
                        {">"} {l.replace(/\[.*?\]\s/, "")}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── STAGE-SPECIFIC ACTION PANELS ─────────────────────────────────── */}

      {/* SOURCING STAGE — Score candidates */}
      {currentStage === "sourcing" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border-main bg-bg-card p-5 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Sourcing Agent — Score Candidates
              </h3>
              <p className="mono text-xs text-text-muted mt-0.5">
                Paste each candidate CV summary. Qwen scores them against the
                job spec.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddCandidate(!showAddCandidate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         bg-accent text-white text-xs font-medium border-0 cursor-pointer"
            >
              <Plus size={12} />
              Add candidate
            </motion.button>
          </div>

          {/* Add candidate form */}
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
                                 focus:border-accent transition-colors placeholder:text-text-muted"
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
                                 focus:border-accent transition-colors placeholder:text-text-muted"
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
                    placeholder="Senior engineer with 6 years in React and Node.js. Led team of 8 at Paystack. Built microservices handling 10M daily requests. AWS certified. Strong CI/CD with GitHub Actions and Docker..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-border-main
                               bg-bg-card text-text-primary text-sm outline-none
                               focus:border-accent transition-colors resize-none
                               placeholder:text-text-muted mono"
                  />
                  <p className="mono text-xs text-text-muted mt-1">
                    {candidateProfile.length} chars
                  </p>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleScoreCandidate}
                    disabled={
                      submitting ||
                      !candidateName.trim() ||
                      !candidateProfile.trim()
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent
                               text-white text-xs font-medium border-0 cursor-pointer
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
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
                    ) : null}
                    {submitting
                      ? "Scoring with Qwen..."
                      : "Score with Sourcing Agent"}
                  </motion.button>
                  <button
                    onClick={() => setShowAddCandidate(false)}
                    className="px-3 py-2 rounded-lg border border-border-main
                               text-text-muted text-xs cursor-pointer hover:bg-bg-hover"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scored candidates list */}
          {scoredCandidates.length === 0 ? (
            <div
              className="flex items-center justify-center h-16
                            border border-dashed border-border-main rounded-xl"
            >
              <p className="mono text-xs text-text-muted">
                No candidates yet — click Add candidate
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {scoredCandidates.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border-main bg-bg-secondary overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer
                               hover:bg-bg-hover transition-colors"
                    onClick={() =>
                      setExpandedCandidate(
                        expandedCandidate === c.name ? null : c.name,
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center
                                   text-xs font-bold"
                        style={{
                          backgroundColor:
                            c.score >= 80
                              ? "rgba(16,185,129,0.15)"
                              : c.score >= 60
                                ? "rgba(245,158,11,0.15)"
                                : "rgba(239,68,68,0.15)",
                          color:
                            c.score >= 80
                              ? "#10B981"
                              : c.score >= 60
                                ? "#F59E0B"
                                : "#EF4444",
                        }}
                      >
                        {c.name?.charAt(0)}
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
                            color:
                              c.score >= 80
                                ? "#10B981"
                                : c.score >= 60
                                  ? "#F59E0B"
                                  : "#EF4444",
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
                              : c.recommendation === "yes"
                                ? "#06B6D4"
                                : c.recommendation === "maybe"
                                  ? "#F59E0B"
                                  : "#EF4444",
                          backgroundColor:
                            c.recommendation === "strong_yes"
                              ? "rgba(16,185,129,0.1)"
                              : c.recommendation === "yes"
                                ? "rgba(6,182,212,0.1)"
                                : c.recommendation === "maybe"
                                  ? "rgba(245,158,11,0.1)"
                                  : "rgba(239,68,68,0.1)",
                        }}
                      >
                        {c.recommendation?.replace("_", " ").toUpperCase()}
                      </span>
                      {expandedCandidate === c.name ? (
                        <ChevronUp size={14} color="#4B5563" />
                      ) : (
                        <ChevronDown size={14} color="#4B5563" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedCandidate === c.name && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-border-main"
                      >
                        <div className="p-4 space-y-3">
                          {/* Score bar */}
                          <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${c.score}%` }}
                              className="h-full rounded-full"
                              style={{
                                background:
                                  c.score >= 80
                                    ? "linear-gradient(90deg,#059669,#10B981)"
                                    : c.score >= 60
                                      ? "linear-gradient(90deg,#D97706,#F59E0B)"
                                      : "linear-gradient(90deg,#DC2626,#EF4444)",
                              }}
                            />
                          </div>

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

          {/* Approve shortlist button — only shows when candidates exist */}
          {scoredCandidates.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 rounded-xl border border-border-main
                         bg-bg-secondary flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {scoredCandidates.length} candidate
                  {scoredCandidates.length > 1 ? "s" : ""} scored
                </p>
                <p className="mono text-xs text-text-muted mt-0.5">
                  Approve shortlist to activate Screening Agent
                </p>
                {scoredCandidates.some((c: any) => c.score < 70) && (
                  <p className="mono text-xs mt-1" style={{ color: "#F59E0B" }}>
                    ⚠ Conflict Agent will review borderline candidates
                  </p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApproveShortlist}
                className="px-5 py-2.5 rounded-lg bg-accent text-white
                           text-xs font-semibold border-0 cursor-pointer"
              >
                Approve shortlist →
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* SCREENING STAGE — recruiter must screen then mark done */}
      {currentStage === "screening" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border-main bg-bg-card p-5 mb-4"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Screening Agent — Active
              </h3>
              <p className="mono text-xs text-text-muted mt-0.5">
                The Screening Agent is ready to conduct candidate interviews. Go
                to the Candidates page, click Screen candidate on each
                candidate, and chat as if you are asking screening questions.
                Come back here when done to approve the final shortlist.
              </p>
            </div>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
              style={{ backgroundColor: "#6366F1" }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/candidates"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg
                         border border-border-main bg-bg-secondary
                         text-sm font-medium text-text-secondary
                         hover:bg-bg-hover transition-colors cursor-pointer"
            >
              <MessageSquare size={14} />
              Go to Candidates → Screen now
            </Link>

            {!requiresApproval && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkScreeningDone}
                disabled={markingScreeningDone}
                className="px-4 py-2.5 rounded-lg border text-sm font-medium
                           cursor-pointer disabled:opacity-40"
                style={{
                  borderColor: "rgba(99,102,241,0.4)",
                  backgroundColor: "rgba(99,102,241,0.08)",
                  color: "#6366F1",
                }}
              >
                {markingScreeningDone
                  ? "Marking done..."
                  : "Mark screening complete →"}
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* COMPLETED STAGE */}
      {currentStage === "completed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border p-6 mb-4 text-center"
          style={{
            borderColor: "rgba(16,185,129,0.3)",
            backgroundColor: "rgba(16,185,129,0.05)",
          }}
        >
          <CheckCircle size={32} color="#10B981" className="mx-auto mb-3" />
          <h3 className="font-syne font-bold text-lg text-text-primary mb-1">
            Pipeline Complete
          </h3>
          <p className="mono text-xs text-text-muted">
            All 6 agents have completed their work. View final candidates below.
          </p>
          <Link
            href="/candidates"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg
                       bg-accent text-white text-sm font-medium cursor-pointer"
          >
            View final candidates →
          </Link>
        </motion.div>
      )}

      {/* Coordinator Log */}
      {log.length > 0 && (
        <div className="rounded-xl border border-border-main bg-bg-card p-5">
          <p className="mono text-xs text-text-muted mb-3">Coordinator log</p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {log.map((line, i) => (
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
                          : line.includes("Human:") || line.includes("Conflict")
                            ? "#F59E0B"
                            : "#94A3B8",
                  }}
                >
                  {line.replace(/\[\d{4}-\d{2}-\d{2}T.*?\]\s/, "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval modal */}
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
