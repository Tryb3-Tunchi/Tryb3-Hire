"use client";

import { motion } from "framer-motion";
import { Zap, Brain, Database, Activity } from "lucide-react";
import { useEffect, useState } from "react";

const STAGE_AGENT_COUNT: Record<string, number> = {
  intake: 1,
  market: 2,
  sourcing: 3,
  screening: 4,
  completed: 6,
};

export default function SystemHealth() {
  const [stats, setStats] = useState({
    activePipelines: 0,
    totalPipelines: 0,
    activeAgents: 0,
    completedPipelines: 0,
  });

  useEffect(() => {
    const fetch_stats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines`
        );
        const data = await res.json();
        const pipelines = data.pipelines ?? [];

        const active = pipelines.filter(
          (p: any) => p.currentStage !== "completed"
        );
        const completed = pipelines.filter(
          (p: any) => p.currentStage === "completed"
        );

        const agentCount = active.reduce((acc: number, p: any) => {
          return acc + (STAGE_AGENT_COUNT[p.currentStage] ?? 0);
        }, 0);

        setStats({
          activePipelines: active.length,
          totalPipelines: pipelines.length,
          activeAgents: agentCount,
          completedPipelines: completed.length,
        });
      } catch {
        // keep defaults
      }
    };

    fetch_stats();
    const interval = setInterval(fetch_stats, 5000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    {
      icon: Zap,
      label: "Active pipelines",
      value: stats.activePipelines.toString(),
      sub: `${stats.completedPipelines} completed`,
      color: "#10B981",
    },
    {
      icon: Brain,
      label: "Qwen API",
      value: "Online",
      sub: "Alibaba Cloud · Singapore",
      color: "#06B6D4",
    },
    {
      icon: Database,
      label: "Agents deployed",
      value: stats.activeAgents.toString(),
      sub: "across active pipelines",
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
    <div id="system-health" className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
          <p className="text-xl font-semibold text-text-primary">{stat.value}</p>
          <p className="mono text-xs text-text-muted mt-0.5">{stat.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}