export type AgentStatus = 
  | "idle" 
  | "running" 
  | "waiting" 
  | "completed" 
  | "error" 
  | "awaiting_human";

export type AgentId = 
  | "intake"
  | "market"
  | "sourcing"
  | "screening"
  | "conflict"
  | "coordinator";

export interface Agent {
  id: AgentId;
  name: string;
  status: AgentStatus;
  currentTask?: string;
  reasoningTrace?: string[];
  completedAt?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  score: number;
  confidence: number;
  stage: "sourced" | "screened" | "shortlisted" | "interview" | "decision";
  agentNotes: string[];
  flagged: boolean;
}

export interface Pipeline {
  id: string;
  jobTitle: string;
  company: string;
  status: "active" | "paused" | "completed";
  agents: Agent[];
  candidates: Candidate[];
  createdAt: string;
  currentAgentId: AgentId;
  requiresHumanApproval: boolean;
}
export interface PipelineState {
  id: string;
  jobDescription: string;
  jobSpec?: {
    title: string;
    seniority: string;
    requiredSkills: string[];
    niceToHaveSkills: string[];
    experienceYears: number;
    responsibilities: string[];
    salaryRange?: string;
    location?: string;
    rawDescription: string;
  };
  currentStage: string;
  requiresHumanApproval: boolean;
  humanApprovalReason?: string;
  log: string[];
}