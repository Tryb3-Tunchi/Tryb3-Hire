"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pipeline } from "@/lib/types";
import { X, CheckCircle, XCircle } from "lucide-react";

interface Props {
  pipeline: Pipeline;
  onClose: () => void;
}

export default function ApprovalModal({ pipeline, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-border-main 
                     bg-bg-card p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-text-primary">
                Human approval required
              </h3>
              <p className="text-xs text-text-muted mt-0.5 mono">
                {pipeline.jobTitle} · {pipeline.company}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg border border-border-main 
                         bg-bg-secondary flex items-center justify-center cursor-pointer"
            >
              <X size={13} color="#94A3B8" />
            </button>
          </div>

          {/* Message */}
          <div className="rounded-lg bg-bg-secondary border border-border-main p-4 mb-5">
            <p className="text-sm text-text-secondary leading-relaxed">
              The Screening Agent has completed candidate conversations and
              prepared a shortlist of{" "}
              <span className="text-text-primary font-medium">
                {pipeline.candidates.length} candidates
              </span>
              . Review and approve to proceed with interview scheduling.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 
                         rounded-lg bg-accent text-white text-sm font-medium 
                         cursor-pointer border-0"
            >
              <CheckCircle size={14} />
              Approve shortlist
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 
                         rounded-lg border border-border-main bg-bg-secondary 
                         text-text-secondary text-sm font-medium cursor-pointer"
            >
              <XCircle size={14} />
              Request revision
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
