"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pipeline } from "@/lib/types";
import { X, CheckCircle, XCircle, TrendingUp, Users, Brain } from "lucide-react";

interface Props {
  pipeline: Pipeline;
  onClose: () => void;
}

export default function ApprovalModal({ pipeline, onClose }: Props) {
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lp = pipeline as any;
  const currentStage = lp?.currentStage ?? "market";
  const marketData = lp?.marketIntelligence;

  const handleApprove = async () => {
    if (isApproving) return;
    setIsApproving(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/${pipeline.id}/approve`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setIsApproving(false);
        return;
      }

      onClose();
      window.location.reload();
    } catch {
      setError("Network error — please try again");
      setIsApproving(false);
    }
  };

  // Different content per stage
  const stageContent = {
    market: {
      icon: TrendingUp,
      iconColor: "#06B6D4",
      title: "Approve market findings",
      subtitle: "Review the market intelligence before sourcing begins",
      body: (
        <div className="space-y-3">
          {marketData ? (
            <>
              <div className="flex items-center justify-between py-2
                              border-b border-border-main">
                <span className="mono text-xs text-text-muted">Salary range</span>
                <span className="mono text-xs text-accent font-semibold">
                  ${marketData.salaryRange?.min?.toLocaleString()} — ${marketData.salaryRange?.max?.toLocaleString()} {marketData.salaryRange?.currency}
                </span>
              </div>
              <div className="flex items-center justify-between py-2
                              border-b border-border-main">
                <span className="mono text-xs text-text-muted">Talent supply</span>
                <span className="mono text-xs text-text-primary capitalize">
                  {marketData.talentSupply}
                </span>
              </div>
              <div className="flex items-center justify-between py-2
                              border-b border-border-main">
                <span className="mono text-xs text-text-muted">Avg time to hire</span>
                <span className="mono text-xs text-text-primary">
                  {marketData.averageTimeToHire}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="mono text-xs text-text-muted">Top competitors</span>
                <span className="mono text-xs text-text-primary">
                  {marketData.topCompetitors?.slice(0, 2).join(", ")}
                </span>
              </div>
              <p className="mono text-xs text-text-muted pt-2 leading-relaxed">
                {marketData.marketSummary}
              </p>
            </>
          ) : (
            <p className="mono text-xs text-text-muted">
              Loading market data...
            </p>
          )}
        </div>
      ),
      approveLabel: "Approve — begin sourcing",
    },
    screening: {
      icon: Brain,
      iconColor: "#F59E0B",
      title: "Approve final shortlist",
      subtitle: "Screening complete — confirm candidates to complete the pipeline",
      body: (
        <div className="space-y-2">
          <p className="text-sm text-text-secondary leading-relaxed">
            The Screening Agent has conducted candidate interviews.
            Approving this will mark the pipeline as complete and
            finalize your candidate shortlist.
          </p>
          <p className="mono text-xs text-text-muted mt-2">
            Make sure you have screened all candidates on the Candidates
            page before approving.
          </p>
        </div>
      ),
      approveLabel: "Approve — complete pipeline",
    },
  };

  const content = stageContent[currentStage as keyof typeof stageContent]
    ?? stageContent.market;

  const ContentIcon = content.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-border-main bg-bg-card"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5
                          border-b border-border-main">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${content.iconColor}15` }}
              >
                <ContentIcon size={16} color={content.iconColor} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-text-primary">
                  {content.title}
                </h3>
                <p className="mono text-xs text-text-muted mt-0.5">
                  {content.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg border border-border-main
                         bg-bg-secondary flex items-center justify-center
                         cursor-pointer hover:bg-bg-hover transition-colors"
            >
              <X size={13} color="#94A3B8" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {content.body}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 rounded-lg border mono text-xs"
                style={{
                  borderColor: "rgba(239,68,68,0.3)",
                  backgroundColor: "rgba(239,68,68,0.05)",
                  color: "#EF4444",
                }}
              >
                {error}
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-5 pb-5">
            <motion.button
              whileHover={{ scale: isApproving ? 1 : 1.02 }}
              whileTap={{ scale: isApproving ? 1 : 0.97 }}
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 flex items-center justify-center gap-2
                         py-2.5 rounded-xl bg-accent text-white text-sm
                         font-medium cursor-pointer border-0
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={14} />
              {isApproving ? "Approving..." : content.approveLabel}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2
                         py-2.5 rounded-xl border border-border-main
                         bg-bg-secondary text-text-secondary text-sm
                         font-medium cursor-pointer"
            >
              <XCircle size={14} />
              Not yet
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}