"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, FileText, Mail, Upload } from "lucide-react";
import { api } from "@/lib/api/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type InputMode = "text" | "email" | "pdf";

export default function NewPipelineModal({ isOpen, onClose }: Props) {
  const [mode, setMode] = useState<InputMode>("text");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "processing">("input");

  const modes = [
    { id: "text" as InputMode, icon: FileText, label: "Paste JD" },
    { id: "email" as InputMode, icon: Mail, label: "From email" },
    { id: "pdf" as InputMode, icon: Upload, label: "Upload PDF" },
  ];

  const handleSubmit = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      alert("Please enter a longer job description (at least 50 characters)");
      return;
    }
    setLoading(true);
    setStep("processing");

    try {
      const result = await api.createPipeline(jobDescription);
      console.log("Pipeline created:", result.pipelineId);

      // Wait 3 seconds to show animation
      await new Promise((r) => setTimeout(r, 3000));

      // Close modal and navigate to pipeline
      onClose();
      setStep("input");
      setJobDescription("");

      // Navigate to the new pipeline
      window.location.href = `/pipeline/${result.pipelineId}`;
    } catch (error) {
      console.error("Failed:", error);
      alert("Failed to create pipeline. Check that your backend is running.");
      setStep("input");
      setLoading(false);
    }
  };

  const agentSteps = [
    { label: "Intake Agent parsing job description...", done: true },
    { label: "Extracting required skills and seniority...", done: true },
    { label: "Market Agent researching talent pool...", done: false },
    { label: "Coordinator initializing pipeline...", done: false },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-border-main"
              style={{ backgroundColor: "var(--color-bg-card)" }}
            >
              {step === "input" ? (
                <>
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-5 py-4
                                  border-b border-border-main"
                  >
                    <div className="flex items-center gap-2">
                      <Zap size={15} color="#10B981" />
                      <span className="font-semibold text-sm text-text-primary">
                        New hiring request
                      </span>
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

                  {/* Input mode tabs */}
                  <div className="px-5 pt-5">
                    <div
                      className="flex gap-1 mb-4 p-1 rounded-lg bg-bg-secondary
                                    border border-border-main w-fit"
                    >
                      {modes.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setMode(m.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md
                                     text-xs font-medium transition-all cursor-pointer"
                          style={{
                            backgroundColor:
                              mode === m.id
                                ? "var(--color-bg-card)"
                                : "transparent",
                            color:
                              mode === m.id
                                ? "var(--color-text-primary)"
                                : "var(--color-text-muted)",
                            border:
                              mode === m.id
                                ? "1px solid var(--color-border)"
                                : "1px solid transparent",
                          }}
                        >
                          <m.icon size={12} />
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {/* Text input */}
                    {mode === "text" && (
                      <div>
                        <label className="mono text-xs text-text-muted mb-2 block">
                          Paste job description
                        </label>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="We are looking for a Senior Frontend Engineer with 5+ years of React experience..."
                          rows={8}
                          className="w-full rounded-xl border border-border-main
                                     bg-bg-secondary text-text-primary text-sm
                                     p-3.5 resize-none outline-none mono
                                     placeholder:text-text-muted
                                     focus:border-accent transition-colors"
                        />
                        <p className="mono text-xs text-text-muted mt-1.5">
                          {jobDescription.length} characters
                        </p>
                      </div>
                    )}

                    {/* Email mode placeholder */}
                    {mode === "email" && (
                      <div
                        className="flex flex-col items-center justify-center
                                      h-40 gap-3 rounded-xl border border-border-main
                                      border-dashed bg-bg-secondary"
                      >
                        <Mail size={20} color="#2A3347" />
                        <p className="mono text-xs text-text-muted text-center">
                          Email integration coming soon
                          <br />
                          Connect your inbox in Settings
                        </p>
                      </div>
                    )}

                    {/* PDF mode placeholder */}
                    {mode === "pdf" && (
                      <div
                        className="flex flex-col items-center justify-center h-40 gap-3
               rounded-xl border border-border-main border-dashed
               bg-bg-secondary cursor-pointer hover:border-accent
               transition-colors"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".pdf";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) {
                              setJobDescription(
                                `PDF uploaded: ${file.name} — Qwen-VL will process this when pipeline starts`,
                              );
                              setMode("text");
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload size={20} color="#2A3347" />
                        <p className="mono text-xs text-text-muted text-center">
                          Drop a PDF here or click to browse
                          <br />
                          Qwen-VL will extract the job spec
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between px-5 py-4 mt-4
                                  border-t border-border-main"
                  >
                    <p className="mono text-xs text-text-muted">
                      6 agents will be deployed automatically
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg border border-border-main
                                   bg-transparent text-text-secondary text-xs
                                   cursor-pointer hover:bg-bg-hover transition-colors"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit}
                        disabled={mode === "text" && !jobDescription.trim()}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg
                                   bg-accent text-white text-xs font-medium
                                   cursor-pointer border-0 disabled:opacity-40
                                   disabled:cursor-not-allowed"
                      >
                        <Zap size={12} />
                        Deploy agents
                      </motion.button>
                    </div>
                  </div>
                </>
              ) : (
                /* Processing state */
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Zap size={16} color="#10B981" />
                    </motion.div>
                    <span className="font-semibold text-sm text-text-primary">
                      Deploying agents...
                    </span>
                  </div>

                  <div className="space-y-3">
                    {agentSteps.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.4 }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: step.done ? "#10B981" : "#2A3347",
                          }}
                        />
                        <span
                          className="mono text-xs"
                          style={{
                            color: step.done ? "#94A3B8" : "#4B5563",
                          }}
                        >
                          {step.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <p className="mono text-xs text-text-muted mt-6">
                    This will take a moment...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
