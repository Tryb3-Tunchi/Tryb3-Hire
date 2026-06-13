"use client";

import { motion } from "framer-motion";
import { mockPipelines } from "@/lib/mockData";
import { Flag, Star } from "lucide-react";

const allCandidates = mockPipelines.flatMap((p) =>
  p.candidates.map((c) => ({ ...c, jobTitle: p.jobTitle, company: p.company })),
);

const stageColors: Record<string, string> = {
  sourced: "#4B5563",
  screened: "#06B6D4",
  shortlisted: "#6366F1",
  interview: "#F59E0B",
  decision: "#10B981",
};

export default function CandidatesPage() {
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
        </p>
      </motion.div>

      <div className="rounded-xl border border-border-main overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-5 px-4 py-3 border-b border-border-main bg-bg-secondary">
          {["Name", "Role", "Score", "Stage", "Status"].map((col) => (
            <span key={col} className="mono text-xs text-text-muted">
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {allCandidates.map((candidate, i) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.06 }}
            className="grid grid-cols-5 px-4 py-3.5 border-b border-border-main
                       bg-bg-card hover:bg-bg-hover transition-colors cursor-pointer
                       items-center"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">
                {candidate.name}
              </p>
              <p className="mono text-xs text-text-muted">{candidate.email}</p>
            </div>

            <div>
              <p className="text-xs text-text-secondary">
                {candidate.jobTitle}
              </p>
              <p className="mono text-xs text-text-muted">
                {candidate.company}
              </p>
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
                color: stageColors[candidate.stage],
                backgroundColor: `${stageColors[candidate.stage]}15`,
              }}
            >
              {candidate.stage}
            </span>

            <div className="flex items-center gap-2">
              {candidate.flagged && <Flag size={12} color="#EF4444" />}
              <Star size={12} color="#4B5563" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
