"use client";

import { Agent, AgentId } from "@/lib/types";
import AgentNode from "./AgentNode";

interface Props {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  selectedAgentId: AgentId | null;
}

export default function AgentPipeline({ agents, onSelectAgent, selectedAgentId }: Props) {
  return (
    <div className="flex items-start justify-between overflow-x-auto pb-2">
      {agents.map((agent, i) => (
        <AgentNode
          key={agent.id}
          agent={agent}
          isLast={i === agents.length - 1}
          isSelected={selectedAgentId === agent.id}
          onClick={() => onSelectAgent(agent)}
        />
      ))}
    </div>
  );
}