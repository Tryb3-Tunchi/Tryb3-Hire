import { Pipeline } from "./types";

export const mockPipelines: Pipeline[] = [
  {
    id: "pipe-001",
    jobTitle: "Senior Frontend Engineer",
    company: "Acme Corp",
    status: "active",
    createdAt: "2026-06-10T09:00:00Z",
    currentAgentId: "sourcing",
    requiresHumanApproval: false,
    candidates: [
      {
        id: "cand-001",
        name: "Amara Osei",
        email: "amara@email.com",
        score: 87,
        confidence: 92,
        stage: "shortlisted",
        agentNotes: [
          "Strong React and TypeScript background",
          "Led frontend team at previous role",
          "Salary expectation within budget range"
        ],
        flagged: false,
      },
      {
        id: "cand-002",
        name: "Yusuf Balogun",
        email: "yusuf@email.com",
        score: 74,
        confidence: 68,
        stage: "screened",
        agentNotes: [
          "Good technical skills but limited leadership experience",
          "Inconsistency detected between session 1 and session 2 responses"
        ],
        flagged: true,
      },
    ],
    agents: [
      { id: "intake", name: "Intake Agent", status: "completed" },
      { id: "market", name: "Market Intelligence Agent", status: "completed" },
      { id: "sourcing", name: "Sourcing & Scoring Agent", status: "running",
        currentTask: "Scoring 14 candidates against job specification",
        reasoningTrace: [
          "Loaded job specification for Senior Frontend Engineer",
          "Identified 3 required skills: React, TypeScript, System Design",
          "Scanning candidate pool — 47 profiles retrieved",
          "Filtering by minimum 4 years experience threshold",
          "Scoring candidate Amara Osei — match score: 87/100",
          "Reasoning: Strong React (5yrs), TypeScript (3yrs), led team of 6",
          "Scoring candidate Yusuf Balogun — match score: 74/100",
          "Reasoning: React (3yrs), TypeScript (2yrs), no leadership signal found"
        ]
      },
      { id: "screening", name: "Screening Agent", status: "idle" },
      { id: "conflict", name: "Conflict Resolution Agent", status: "idle" },
      { id: "coordinator", name: "Coordinator Agent", status: "running",
        currentTask: "Orchestrating sourcing phase"
      },
    ],
  },
  {
    id: "pipe-002",
    jobTitle: "DevOps Engineer",
    company: "Stellar Labs",
    status: "active",
    createdAt: "2026-06-11T14:00:00Z",
    currentAgentId: "screening",
    requiresHumanApproval: true,
    candidates: [],
    agents: [
      { id: "intake", name: "Intake Agent", status: "completed" },
      { id: "market", name: "Market Intelligence Agent", status: "completed" },
      { id: "sourcing", name: "Sourcing & Scoring Agent", status: "completed" },
      { id: "screening", name: "Screening Agent", status: "awaiting_human",
        currentTask: "Shortlist ready — awaiting recruiter approval before outreach"
      },
      { id: "conflict", name: "Conflict Resolution Agent", status: "idle" },
      { id: "coordinator", name: "Coordinator Agent", status: "waiting" },
    ],
  },
];