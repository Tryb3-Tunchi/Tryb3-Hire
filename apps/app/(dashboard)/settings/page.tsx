"use client";

import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";

export default function SettingsPage() {
  const [apiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  );
  const [checking, setChecking] = useState(false);
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">(
    "checking",
  );

  const checkHealth = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${apiUrl}/health`);
      const data = await res.json();
      setApiStatus(data.status === "ok" ? "online" : "offline");
    } catch {
      setApiStatus("offline");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your TryB3 workspace
        </p>
      </motion.div>

      <div className="space-y-3">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between p-4 rounded-xl
                     border border-border-main bg-bg-card"
        >
          <div>
            <p className="text-sm font-medium text-text-primary">Appearance</p>
            <p className="mono text-xs text-text-muted mt-0.5">
              Toggle light and dark mode
            </p>
          </div>
          <ThemeToggle />
        </motion.div>

        {/* API Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.07 }}
          className="flex items-center justify-between p-4 rounded-xl
                     border border-border-main bg-bg-card"
        >
          <div>
            <p className="text-sm font-medium text-text-primary">Backend API</p>
            <p className="mono text-xs text-text-muted mt-0.5">{apiUrl}</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-md"
              style={{
                backgroundColor:
                  apiStatus === "online"
                    ? "rgba(16,185,129,0.1)"
                    : "rgba(239,68,68,0.1)",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    apiStatus === "online" ? "#10B981" : "#EF4444",
                }}
              />
              <span
                className="mono text-xs"
                style={{
                  color: apiStatus === "online" ? "#10B981" : "#EF4444",
                }}
              >
                {apiStatus}
              </span>
            </div>
            <button
              onClick={checkHealth}
              disabled={checking}
              className="mono text-xs text-text-muted cursor-pointer
                         hover:text-text-secondary transition-colors"
            >
              {checking ? "checking..." : "check"}
            </button>
          </div>
        </motion.div>

        {/* Qwen Cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14 }}
          className="flex items-center justify-between p-4 rounded-xl
                     border border-border-main bg-bg-card"
        >
          <div>
            <p className="text-sm font-medium text-text-primary">Qwen Cloud</p>
            <p className="mono text-xs text-text-muted mt-0.5">
              Alibaba Cloud · Singapore · qwen3.7-max
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="mono text-xs text-accent">Connected</span>
          </div>
        </motion.div>

        {/* ECS Deployment */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.21 }}
          className="flex items-center justify-between p-4 rounded-xl
                     border border-border-main bg-bg-card"
        >
          <div>
            <p className="text-sm font-medium text-text-primary">
              Alibaba Cloud ECS
            </p>
            <p className="mono text-xs text-text-muted mt-0.5">
              47.84.231.238 · Singapore · Ubuntu 22.04
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="mono text-xs text-accent">Deployed</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
