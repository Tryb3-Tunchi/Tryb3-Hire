import { create } from "zustand";
import { Agent, AgentId, AgentStatus } from "../types";

interface AgentStore {
  agents: Agent[];
  setAgentStatus: (id: AgentId, status: AgentStatus) => void;
  appendReasoningTrace: (id: AgentId, line: string) => void;
  resetAgents: () => void;
}

const defaultAgents: Agent[] = [
  { id: "intake", name: "Intake Agent", status: "idle" },
  { id: "market", name: "Market Intelligence Agent", status: "idle" },
  { id: "sourcing", name: "Sourcing & Scoring Agent", status: "idle" },
  { id: "screening", name: "Screening Agent", status: "idle" },
  { id: "conflict", name: "Conflict Resolution Agent", status: "idle" },
  { id: "coordinator", name: "Coordinator Agent", status: "idle" },
];

export const useAgentStore = create<AgentStore>((set) => ({
  agents: defaultAgents,

  setAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    })),

  appendReasoningTrace: (id, line) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id
          ? { ...a, reasoningTrace: [...(a.reasoningTrace || []), line] }
          : a
      ),
    })),

  resetAgents: () => set({ agents: defaultAgents }),
}));