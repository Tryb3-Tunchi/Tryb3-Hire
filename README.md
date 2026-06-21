# TryB3 — Autonomous Talent Intelligence Platform

> Six agents. One hire. Zero guesswork.

Built for the Global AI Hackathon with Qwen Cloud.

## Tracks
- Track 3: Agent Society
- Track 4: Autopilot Agent

## Architecture
![Architecture](./architecture.png)

## What It Does
TryB3 deploys six AI agents that handle the entire recruitment 
pipeline autonomously — from parsing a job description to 
shortlisting candidates — with human approval at critical steps.

## Agent Pipeline
| Agent | Model | Role |
|---|---|---|
| Intake | Qwen-Max | Parses job descriptions to structured JSON |
| Market | Qwen-Max | Researches salary benchmarks and talent supply |
| Sourcing | Qwen-Max | Scores candidates with full reasoning trace |
| Screening | Qwen-Plus | Multi-turn conversations with persistent memory |
| Conflict | Qwen-Max | Mediates disagreements between agents |
| Coordinator | Qwen-Max | Orchestrates the full pipeline |

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| AI | Qwen-Max, Qwen-Plus via Qwen Cloud |
| Database | Alibaba Cloud RDS PostgreSQL |
| Memory | Alibaba Cloud AnalyticDB Vector DB |
| Queue | Alibaba Cloud Redis |
| Storage | Alibaba Cloud OSS |
| Deployment | Alibaba Cloud ECS |

## Setup

### Frontend
\`\`\`bash
cd apps
npm install
cp .env.local.example .env.local
npm run dev
\`\`\`

### Backend
\`\`\`bash
cd api
npm install
cp .env.example .env
npm run dev
\`\`\`

### Environment Variables
\`\`\`env
QWEN_API_KEY=your_key_here
NEXT_PUBLIC_API_URL=http://localhost:4000
\`\`\`

## License
MIT