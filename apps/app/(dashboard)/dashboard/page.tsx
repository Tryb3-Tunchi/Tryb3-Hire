"use client";

import { motion } from "framer-motion";
import { mockPipelines } from "@/lib/mockData";
import SystemHealth from "@/components/dashboard/SystemHealth";
import { Plus } from "lucide-react";
import PipelineCard from "@/components/dashboard/PipeLineCard";

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1
            className="font-syne text-3xl font-bold"
            style={{ color: "#F0F4FF" }}
          >
            Command Center
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8892A4" }}>
            {mockPipelines.filter((p) => p.status === "active").length} active
            pipelines running
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-syne 
                     font-semibold text-sm"
          style={{ backgroundColor: "#00FF94", color: "#080B14" }}
        >
          <Plus size={16} />
          New Hiring Request
        </motion.button>
      </motion.div>

      {/* System Health */}
      <SystemHealth />

      {/* Pipelines */}
      <div className="mt-8">
        <h2
          className="font-syne font-semibold text-lg mb-4"
          style={{ color: "#F0F4FF" }}
        >
          Active Pipelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockPipelines.map((pipeline, i) => (
            <PipelineCard key={pipeline.id} pipeline={pipeline} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
