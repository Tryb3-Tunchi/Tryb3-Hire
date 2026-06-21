"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { mockPipelines } from "@/lib/mockData";
import { Flag } from "lucide-react";
import ScreeningChat from "@/components/pipeline/ScreeningChat";

const allCandidates = mockPipelines.flatMap(p =>
  p.candidates.map(c => ({
    ...c,
    jobTitle: p.jobTitle,
    company: p.company,
  }))
);

const stageColors: Record<string, string> = {
  sourced: "#4B5563",
  screened: "#06B6D4",
  shortlisted: "#6366F1",
  interview: "#F59E0B",
  decision: "#10B981",
};

export default function CandidatesPage() {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");

  const selectedCandidate = allCandidates.find(
    c => c.id === selectedCandidateId
  );

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
          {allCandidates.length} candidates across all pipelines
          {selectedCandidateId && ` · screening ${selectedName}`}
        </p>
      </motion.div>

      {/* Table */}
      <div className="rounded-xl border border-border-main overflow-hidden mb-8">
        <div className="grid grid-cols-5 px-4 py-3 border-b border-border-main
                        bg-bg-secondary">
          {["Name", "Role", "Score", "Stage", "Status"].map(col => (
            <span key={col} className="mono text-xs text-text-muted">
              {col}
            </span>
          ))}
        </div>

        {allCandidates.map((candidate, i) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => {
              setSelectedCandidateId(candidate.id);
              setSelectedName(candidate.name);
            }}
            className={`grid grid-cols-5 px-4 py-3.5 border-b border-border-main
                        transition-colors cursor-pointer items-center
                        ${selectedCandidateId === candidate.id
                          ? "bg-accent/5 border-l-2 border-l-accent"
                          : "bg-bg-card hover:bg-bg-hover"
                        }`}
          >
            <div>
              <p className="text-sm font-medium text-text-primary">
                {candidate.name}
              </p>
              <p className="mono text-xs text-text-muted">{candidate.email}</p>
            </div>

            <div>
              <p className="text-xs text-text-secondary">{candidate.jobTitle}</p>
              <p className="mono text-xs text-text-muted">{candidate.company}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-16 h-1 rounded-full bg-bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${candidate.score}%` }}
                />
              </div>
              <span className="mono text-xs text-text-primary">
                {candidate.score}
              </span>
            </div>

            <span
              className="mono text-xs px-2 py-0.5 rounded w-fit"
              style={{
                color: stageColors[candidate.stage] ?? "#4B5563",
                backgroundColor: `${stageColors[candidate.stage] ?? "#4B5563"}15`,
              }}
            >
              {candidate.stage}
            </span>

            <div className="flex items-center gap-2">
              {candidate.flagged && <Flag size={12} color="#EF4444" />}
              <span className="mono text-xs text-text-muted">
                {selectedCandidateId === candidate.id ? "screening ↓" : "click to screen"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Screening Chat */}
      {selectedCandidateId && selectedCandidate && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">
              Screening — {selectedName}
            </h2>
            <button
              onClick={() => setSelectedCandidateId(null)}
              className="mono text-xs text-text-muted hover:text-text-secondary
                         cursor-pointer"
            >
              close ×
            </button>
          </div>
          <ScreeningChat
            candidateId={selectedCandidateId}
            candidateName={selectedName}
          />
        </motion.div>
      )}
    </div>
  );
}