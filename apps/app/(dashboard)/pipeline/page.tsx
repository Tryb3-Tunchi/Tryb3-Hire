"use client";

import { motion } from "framer-motion";
import { mockPipelines } from "@/lib/mockData";
import { Plus } from "lucide-react";
import PipelineCard from "@/components/dashboard/PipeLineCard";

export default function PipelinesPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Pipelines
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            All active and completed hiring pipelines
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent
                     text-white text-sm font-medium border-0 cursor-pointer"
        >
          <Plus size={15} />
          New pipeline
        </motion.button>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border-main">
        {["All", "Active", "Completed", "Paused"].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer
                        ${
                          i === 0
                            ? "border-accent text-accent"
                            : "border-transparent text-text-muted hover:text-text-secondary"
                        }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mockPipelines.map((pipeline, i) => (
          <PipelineCard key={pipeline.id} pipeline={pipeline} index={i} />
        ))}
      </div>
    </div>
  );
}
