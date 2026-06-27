"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useCandidateStore, ScoredCandidate } from "@/lib/store/candidateStore";
import ScreeningChat from "@/components/pipeline/ScreeningChat";
import { Flag, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

const stageColors: Record<string, string> = {
  sourced: "#4B5563",
  screened: "#06B6D4",
  shortlisted: "#6366F1",
  interview: "#F59E0B",
  decision: "#10B981",
};

const recommendationConfig: Record<string, { color: string; label: string }> = {
  strong_yes: { color: "#10B981", label: "Strong Yes" },
  yes: { color: "#06B6D4", label: "Yes" },
  maybe: { color: "#F59E0B", label: "Maybe" },
  no: { color: "#EF4444", label: "No" },
};

export default function CandidatesPage() {
  const candidates = useCandidateStore((s) => s.candidates);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [screeningName, setScreeningName] = useState("");

  const selected = candidates.find((c) => c.id === selectedId);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Candidates
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {candidates.length} candidates scored by the Sourcing Agent
        </p>
      </motion.div>

      {candidates.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center h-48
                        border border-border-main rounded-xl border-dashed"
        >
          <p className="text-text-muted text-sm mb-2">No candidates yet</p>
          <p className="mono text-xs text-text-muted text-center max-w-xs">
            Go to a pipeline in sourcing stage and add candidates to score them
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate, i) => {
            const rec = recommendationConfig[candidate.recommendation] ?? {
              color: "#4B5563",
              label: candidate.recommendation,
            };
            const isExpanded = expandedTrace === candidate.id;
            const isScreening = screeningId === candidate.id;

            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-border-main bg-bg-card overflow-hidden"
              >
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center
                                   justify-center border border-border-main
                                   text-sm font-semibold text-text-primary"
                        style={{ backgroundColor: "var(--color-bg-secondary)" }}
                      >
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {candidate.name}
                        </p>
                        <p className="mono text-xs text-text-muted">
                          {candidate.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Recommendation badge */}
                      <span
                        className="mono text-xs px-2 py-1 rounded-md font-medium"
                        style={{
                          color: rec.color,
                          backgroundColor: `${rec.color}15`,
                          border: `1px solid ${rec.color}30`,
                        }}
                      >
                        {rec.label}
                      </span>

                      {/* Score */}
                      <div className="text-right">
                        <p
                          className="text-2xl font-bold"
                          style={{
                            color:
                              candidate.score >= 80
                                ? "#10B981"
                                : candidate.score >= 60
                                  ? "#F59E0B"
                                  : "#EF4444",
                          }}
                        >
                          {candidate.score}
                        </p>
                        <p className="mono text-xs text-text-muted">/ 100</p>
                      </div>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="mono text-xs text-text-muted">
                        Match score
                      </span>
                      <span className="mono text-xs text-text-muted">
                        Confidence: {candidate.confidence}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${candidate.score}%` }}
                        transition={{ duration: 0.8, delay: i * 0.06 }}
                        className="h-full rounded-full"
                        style={{
                          background:
                            candidate.score >= 80
                              ? "linear-gradient(90deg, #059669, #10B981)"
                              : candidate.score >= 60
                                ? "linear-gradient(90deg, #D97706, #F59E0B)"
                                : "linear-gradient(90deg, #DC2626, #EF4444)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Strengths and gaps */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="mono text-xs text-accent mb-2">Strengths</p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.strengths.slice(0, 3).map((s, j) => (
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
                    <div>
                      <p
                        className="mono text-xs text-text-muted mb-2"
                        style={{ color: "#EF4444" }}
                      >
                        Gaps
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.gaps.length > 0 ? (
                          candidate.gaps.slice(0, 2).map((g, j) => (
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
                          ))
                        ) : (
                          <span className="mono text-xs text-text-muted">
                            None identified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stage + Actions */}
                  <div className="flex items-center justify-between">
                    <span
                      className="mono text-xs px-2 py-0.5 rounded capitalize"
                      style={{
                        color: stageColors[candidate.stage],
                        backgroundColor: `${stageColors[candidate.stage]}15`,
                      }}
                    >
                      {candidate.stage}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setExpandedTrace(isExpanded ? null : candidate.id)
                        }
                        className="flex items-center gap-1 mono text-xs
                                   text-text-muted hover:text-text-secondary
                                   cursor-pointer transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )}
                        Reasoning trace
                      </button>

                      <button
                        onClick={() => {
                          setScreeningId(isScreening ? null : candidate.id);
                          setScreeningName(candidate.name);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5
                                   rounded-lg border border-border-main
                                   mono text-xs text-text-secondary
                                   hover:bg-bg-hover transition-colors cursor-pointer"
                      >
                        <MessageSquare size={11} />
                        {isScreening ? "Close chat" : "Screen candidate"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reasoning trace expandable */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border-main overflow-hidden"
                    >
                      <div className="p-4 bg-bg-secondary space-y-1.5">
                        <p className="mono text-xs text-text-muted mb-2">
                          Sourcing Agent reasoning
                        </p>
                        {candidate.reasoningTrace.map((line, j) => (
                          <div key={j} className="flex gap-2">
                            <span className="mono text-[10px] text-text-muted w-4">
                              {j + 1}
                            </span>
                            <span className="mono text-xs text-text-secondary">
                              {">"} {line}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Screening chat expandable */}
                <AnimatePresence>
                  {isScreening && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border-main overflow-hidden"
                    >
                      <div className="p-4">
                        <ScreeningChat
                          candidateId={candidate.id}
                          candidateName={candidate.name}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
