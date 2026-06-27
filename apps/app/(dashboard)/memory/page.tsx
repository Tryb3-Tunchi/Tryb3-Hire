"use client";

import { motion } from "framer-motion";
import { Brain, Network, MessageSquare } from "lucide-react";
import { useCandidateStore } from "@/lib/store/candidateStore";
import { useState, useEffect } from "react";

export default function MemoryPage() {
  const candidates = useCandidateStore((s) => s.candidates);
  const [sessions, setSessions] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchSessions = async () => {
      const results: Record<string, any> = {};
      for (const candidate of candidates) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/screening/${candidate.id}/session`,
          );
          if (res.ok) {
            results[candidate.id] = await res.json();
          }
        } catch {
          // No session yet
        }
      }
      setSessions(results);
    };

    if (candidates.length > 0) fetchSessions();
  }, [candidates]);

  const totalMemories = Object.values(sessions).reduce(
    (acc: number, s: any) => acc + (s.memories?.length ?? 0),
    0,
  );

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
          { label: "Total memory nodes", value: totalMemories.toString() },
          { label: "Candidates tracked", value: candidates.length.toString() },
          {
            label: "Sessions active",
            value: Object.keys(sessions).length.toString(),
          },
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

      {candidates.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center h-48
                        border border-border-main rounded-xl border-dashed"
        >
          <Brain size={20} color="#2A3347" className="mb-3" />
          <p className="text-text-muted text-sm mb-1">No memories yet</p>
          <p className="mono text-xs text-text-muted text-center max-w-xs">
            Screen candidates from the Candidates page to build memory nodes
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <Network size={14} color="#6366F1" />
            <h2 className="text-sm font-semibold text-text-primary">
              Candidate memory nodes
            </h2>
          </div>

          {candidates.map((candidate, i) => {
            const session = sessions[candidate.id];
            const memoriesCount = session?.memories?.length ?? 0;
            const messagesCount = session?.messages?.length ?? 0;

            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center justify-between p-4 rounded-xl
                           border border-border-main bg-bg-card
                           hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center
                               border text-sm font-semibold text-text-primary"
                    style={{
                      backgroundColor: "rgba(99,102,241,0.1)",
                      borderColor: "rgba(99,102,241,0.2)",
                    }}
                  >
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {candidate.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="mono text-xs text-text-muted">
                        {memoriesCount} memories
                      </span>
                      {messagesCount > 0 && (
                        <span className="flex items-center gap-1 mono text-xs text-text-muted">
                          <MessageSquare size={10} />
                          {messagesCount} messages
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="mono text-xs text-text-muted mb-1">
                      match score
                    </p>
                    <div className="w-20 h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${candidate.score}%`,
                          backgroundColor:
                            candidate.score >= 80 ? "#10B981" : "#F59E0B",
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="mono text-xs font-semibold"
                    style={{
                      color: candidate.score >= 80 ? "#10B981" : "#F59E0B",
                    }}
                  >
                    {candidate.score}%
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Show actual memories if sessions exist */}
          {Object.entries(sessions).map(([candidateId, session]) => {
            const candidate = candidates.find((c) => c.id === candidateId);
            if (!candidate || !session.memories?.length) return null;

            return (
              <motion.div
                key={`memories-${candidateId}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-border-main bg-bg-secondary p-4 mt-2"
              >
                <p className="mono text-xs text-col-violet mb-3">
                  {candidate.name} — stored memories
                </p>
                <div className="space-y-2">
                  {session.memories.map((memory: string, j: number) => (
                    <div key={j} className="flex gap-2">
                      <span className="mono text-[10px] text-text-muted w-4">
                        {j + 1}
                      </span>
                      <span className="mono text-xs text-text-secondary">
                        {memory}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
