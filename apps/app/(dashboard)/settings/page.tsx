"use client";

import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
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
        {[
          { label: "Appearance", desc: "Toggle light and dark mode" },
          { label: "Qwen API", desc: "Connected · Alibaba Cloud" },
          { label: "Notifications", desc: "Agent alerts and approvals" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center justify-between p-4 rounded-xl
                       border border-border-main bg-bg-card"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">
                {item.label}
              </p>
              <p className="mono text-xs text-text-muted mt-0.5">{item.desc}</p>
            </div>
            {i === 0 && <ThemeToggle />}
            {i === 1 && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="mono text-xs text-accent">Active</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
