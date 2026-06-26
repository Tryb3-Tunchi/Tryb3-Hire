"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Plus, AlertCircle, Loader } from "lucide-react";
import NewPipelineModal from "@/components/dashboard/NewPipelineModal";

export default function PipelinesPage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");

  const fetchPipelines = async () => {
    try {
      const data = await api.getAllPipelines();
      setPipelines(data.pipelines ?? []);
    } catch {
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
    const interval = setInterval(fetchPipelines, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = pipelines.filter(p => {
    if (filter === "All") return true;
    if (filter === "Active") return p.currentStage !== "completed";
    if (filter === "Completed") return p.currentStage === "completed";
    return true;
  });

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
            All hiring pipelines — powered by Qwen agents
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent
                     text-white text-sm font-medium border-0 cursor-pointer"
        >
          <Plus size={15} />
          New pipeline
        </motion.button>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border-main">
        {["All", "Active", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors 
                        cursor-pointer ${
                          filter === tab
                            ? "border-accent text-accent"
                            : "border-transparent text-text-muted hover:text-text-secondary"
                        }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader size={16} className="text-text-muted animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48
                        border border-border-main rounded-xl border-dashed">
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
          {filtered.map((pipeline, i) => {
            const stage = pipeline.currentStage ?? "intake";
            const jobTitle = pipeline.jobSpec?.title ?? "Processing...";
            const stageProgress: Record<string, number> = {
              intake: 1, market: 2, sourcing: 3,
              screening: 4, conflict: 5, completed: 6,
            };
            const progress = Math.round(
              ((stageProgress[stage] ?? 1) / 6) * 100
            );
            const log = pipeline.log ?? [];
            const lastLog = log[log.length - 1] ?? "";

            return (
              <motion.div
                key={pipeline.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -1 }}
                onClick={() => router.push(`/pipeline/${pipeline.id}`)}
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
                  {pipeline.requiresHumanApproval && (
                    <div
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                      style={{
                        backgroundColor: "rgba(245,158,11,0.08)",
                        border: "1px solid rgba(245,158,11,0.2)",
                      }}
                    >
                      <AlertCircle size={11} color="#F59E0B" />
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
                  <p className="mono text-xs text-text-muted truncate">
                    {lastLog}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

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