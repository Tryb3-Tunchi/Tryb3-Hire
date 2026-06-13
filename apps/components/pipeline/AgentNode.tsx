"use client";

import { motion } from "framer-motion";
import { Agent } from "@/lib/types";
import {
  CheckCircle,
  Loader,
  Clock,
  AlertCircle,
  UserCheck,
  Circle,
} from "lucide-react";

const statusConfig = {
  idle: { icon: Circle, color: "#4B5563", label: "Idle" },
  running: { icon: Loader, color: "#06B6D4", label: "Running" },
  waiting: { icon: Clock, color: "#F59E0B", label: "Waiting" },
  completed: { icon: CheckCircle, color: "#10B981", label: "Done" },
  error: { icon: AlertCircle, color: "#EF4444", label: "Error" },
  awaiting_human: { icon: UserCheck, color: "#F59E0B", label: "Needs you" },
};

interface Props {
  agent: Agent;
  isLast?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function AgentNode({ agent, isLast, isSelected, onClick }: Props) {
  const config = statusConfig[agent.status];
  const Icon = config.icon;
  const isActive = agent.status === "running" || agent.status === "awaiting_human";

  return (
    <div className="flex items-center flex-1">
      <motion.div
        whileHover={{ scale: 1.03 }}
        onClick={onClick}
        className="flex flex-col items-center gap-2 cursor-pointer flex-1"
      >
        {/* Circle */}
        <motion.div
          animate={isActive ? {
            boxShadow: [
              `0 0 0px ${config.color}30`,
              `0 0 16px ${config.color}60`,
              `0 0 0px ${config.color}30`,
            ]
          } : {}}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all"
          style={{
            backgroundColor: `${config.color}12`,
            borderColor: isSelected ? config.color : `${config.color}40`,
          }}
        >
          <Icon size={18} color={config.color} />
        </motion.div>

        {/* Name */}
        <span
          className="text-[11px] text-center leading-tight max-w-[72px]"
          style={{
            color: agent.status === "idle" ? "#4B5563" : "#E2E8F0",
          }}
        >
          {agent.name.replace(" Agent", "")}
        </span>

        {/* Status badge */}
        <span
          className="mono text-[10px] px-1.5 py-0.5 rounded"
          style={{
            color: config.color,
            backgroundColor: `${config.color}12`,
          }}
        >
          {config.label}
        </span>
      </motion.div>

      {/* Connector */}
      {!isLast && (
        <div
          className="w-full h-px mx-1 mb-8 flex-shrink-0 max-w-[24px]"
          style={{
            background: agent.status === "completed"
              ? "linear-gradient(90deg, #10B981, #06B6D4)"
              : "#2A3347",
          }}
        />
      )}
    </div>
  );
}