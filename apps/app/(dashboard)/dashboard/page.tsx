"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
// import PipelineCard from "@/components/dashboard/PipelineCard";
import SystemHealth from "@/components/dashboard/SystemHealth";
import NewPipelineModal from "@/components/dashboard/NewPipelineModal";
import { Plus } from "lucide-react";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { api } from "@/lib/api/client";
import { Pipeline } from "@/lib/types";

export default function DashboardPage() {
  useOnboarding();
  const [showModal, setShowModal] = useState(false);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipelines = async () => {
    try {
      const data = await api.getAllPipelines();
      setPipelines(data.pipelines ?? []);
    } catch (err) {
      console.error("Failed to fetch pipelines:", err);
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
    // Poll every 5 seconds for live updates
    const interval = setInterval(fetchPipelines, 5000);
    return () => clearInterval(interval);
  }, []);

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
            {pipelines.filter((p) => p.current_stage !== "completed").length}{" "}
            active pipelines
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
            {pipelines.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="mono text-xs text-text-muted">Loading pipelines...</p>
          </div>
        ) : pipelines.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-48
                          border border-border-main rounded-xl border-dashed"
          >
            <p className="text-text-muted text-sm mb-3">No pipelines yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mono text-xs text-accent cursor-pointer"
            >
              + Create your first hiring request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pipelines.map((pipeline, i) => (
              <RealPipelineCard
                key={pipeline.id}
                pipeline={pipeline}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      <NewPipelineModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          fetchPipelines();
        }}
      />
    </div>
  );
}

// Real pipeline card using actual API data
function RealPipelineCard({
  pipeline,
  index,
}: {
  pipeline: any;
  index: number;
}) {
  const router_push = (id: string) => {
    window.location.href = `/pipeline/${id}`;
  };

  const stage = pipeline.current_stage ?? pipeline.currentStage ?? "intake";
  const jobTitle =
    pipeline.job_spec?.title ?? pipeline.jobSpec?.title ?? "Processing...";
  const log = pipeline.log ?? [];
  const lastLog =
    Array.isArray(log) && log.length > 0 ? log[log.length - 1] : null;

  const stageProgress: Record<string, number> = {
    intake: 1,
    market: 2,
    sourcing: 3,
    screening: 4,
    conflict: 5,
    completed: 6,
  };

  const progress = Math.round(((stageProgress[stage] ?? 1) / 6) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -1 }}
      onClick={() => router_push(pipeline.id)}
      className="rounded-xl p-5 border border-border-main bg-bg-card
                 hover:bg-bg-hover transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            {jobTitle}
          </h3>
          <p className="mono text-xs text-text-muted mt-0.5 capitalize">
            Stage: {stage}
          </p>
        </div>

        {pipeline.requires_human_approval && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-md"
            style={{
              backgroundColor: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <span className="mono text-xs" style={{ color: "#F59E0B" }}>
              Needs you
            </span>
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="mono text-xs text-text-muted">Progress</span>
          <span className="mono text-xs text-accent">{progress}%</span>
        </div>
        <div className="h-1 rounded-full bg-bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-accent"
          />
        </div>
      </div>

      {lastLog && (
        <p className="mono text-xs text-text-muted truncate">{lastLog}</p>
      )}
    </motion.div>
  );
}
