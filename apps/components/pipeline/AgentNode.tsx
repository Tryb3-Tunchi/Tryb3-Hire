"use client";

import { motion } from "framer-motion";
import { Agent } from "@/lib/types";
import { 
  CheckCircle, 
  Loader, 
  Clock, 
  AlertCircle, 
  UserCheck,
  Circle
} from "lucide-react";

const statusConfig = {
  idle: { icon: Circle, color: "#8892A4", label: "Idle", pulse: false },
  running: { icon: Loader, color: "#00D4FF", label: "Running", pulse: true },
  waiting: { icon: Clock, color: "#FF8C00", label: "Waiting", pulse: false },
  completed: { icon: CheckCircle, color: "#00FF94", label: "Done", pulse: false },
  error: { icon: AlertCircle, color: "#EF4444", label: "Error", pulse: false },
  awaiting_human: { icon: UserCheck, color: "#FF8C00", label: "Needs You", pulse: true },
};

interface AgentNodeProps {
  agent: Agent;
  isLast?: boolean;
  onClick?: () => void;
}

export default function AgentNode({ agent, isLast, onClick }: AgentNodeProps) {
  const config = statusConfig[agent.status];
  const Icon = config.icon;

  return (
    <div className="flex items-center">
      <motion.div
        whileHover={{ scale: 1.05 }}
        onClick={onClick}
        className="flex flex-col items-center gap-2 cursor-pointer"
      >
        {/* Node circle */}
        <motion.div
          animate={config.pulse ? { 
            boxShadow: [
              `0 0 0px ${config.color}40`,
              `0 0 20px ${config.color}80`,
              `0 0 0px ${config.color}40`,
            ]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-12 h-12 rounded-full flex items-center justify-center border"
          style={{
            backgroundColor: `${config.color}15`,
            borderColor: `${config.color}40`,
          }}
        >
          <Icon size={20} color={config.color} />
        </motion.div>

        {/* Agent name */}
        <span 
          className="text-xs text-center max-w-20 leading-tight"
          style={{ color: agent.status === "idle" ? "#8892A4" : "#F0F4FF" }}
        >
          {agent.name.replace(" Agent", "")}
        </span>

        {/* Status label */}
        <span 
          className="mono text-xs px-2 py-0.5 rounded-full"
          style={{ 
            color: config.color,
            backgroundColor: `${config.color}15`,
          }}
        >
          {config.label}
        </span>
      </motion.div>

      {/* Connector line */}
      {!isLast && (
        <motion.div
          className="w-8 h-px mx-2 mb-8"
          style={{
            background: agent.status === "completed"
              ? "linear-gradient(90deg, #00FF94, #00D4FF)"
              : "rgba(255,255,255,0.1)",
          }}
        />
      )}
    </div>
  );
}