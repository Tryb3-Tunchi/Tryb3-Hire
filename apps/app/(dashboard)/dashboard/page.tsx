"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { mockPipelines } from "@/lib/mockData";
import PipelineCard from "@/components/dashboard/PipeLineCard";
import SystemHealth from "@/components/dashboard/SystemHealth";
import NewPipelineModal from "@/components/dashboard/NewPipelineModal";
import { Plus } from "lucide-react";
import { useOnboarding } from "@/lib/hooks/useOnboarding";

export default function DashboardPage() {
  useOnboarding();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Command Center
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {mockPipelines.filter((p) => p.status === "active").length} active
            pipelines
          </p>
        </div>

        <motion.button
          id="new-pipeline-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent
                     text-white text-sm font-medium border-0 cursor-pointer"
        >
          <Plus size={15} />
          New hiring request
        </motion.button>
      </motion.div>

      <div id="system-health">
        <SystemHealth />
      </div>

      <div className="mt-8" id="pipeline-list">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">
            Active pipelines
          </h2>
          <span className="mono text-xs text-text-muted">
            {mockPipelines.length} total
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mockPipelines.map((pipeline, i) => (
            <PipelineCard key={pipeline.id} pipeline={pipeline} index={i} />
          ))}
        </div>
      </div>

      <NewPipelineModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}