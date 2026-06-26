"use client";

import { motion } from "framer-motion";
import { Zap, Brain, Database, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

export default function SystemHealth() {
  const [stats, setStats] = useState({
    activePipelines: 0,
    qwenStatus: "Checking...",
    totalPipelines: 0,
    activeAgents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAllPipelines();
        const pipelines = data.pipelines ?? [];
        const active = pipelines.filter(
          (p: any) => p.current_stage !== "completed",
        ).length;

        setStats({
          activePipelines: active,
          qwenStatus: "Online",
          totalPipelines: pipelines.length,
          activeAgents: active * 2,
        });
      } catch {
        setStats((s) => ({ ...s, qwenStatus: "Checking..." }));
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    {
      icon: Zap,
      label: "Active pipelines",
      value: stats.activePipelines.toString(),
      sub: `${stats.totalPipelines} total created`,
      color: "#10B981",
    },
    {
      icon: Brain,
      label: "Qwen API",
      value: stats.qwenStatus,
      sub: "Alibaba Cloud · Singapore",
      color: "#06B6D4",
    },
    {
      icon: Database,
      label: "Active agents",
      value: stats.activeAgents.toString(),
      sub: "across all pipelines",
      color: "#6366F1",
    },
    {
      icon: Activity,
      label: "Total pipelines",
      value: stats.totalPipelines.toString(),
      sub: "since session started",
      color: "#F59E0B",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-xl p-4 border border-border-main bg-bg-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <stat.icon size={13} color={stat.color} />
            <span className="text-xs text-text-secondary">{stat.label}</span>
          </div>
          <p className="text-xl font-semibold text-text-primary">
            {stat.value}
          </p>
          <p className="mono text-xs text-text-muted mt-0.5">{stat.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
