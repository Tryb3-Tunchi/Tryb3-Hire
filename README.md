# TryB3 — Autonomous Talent Intelligence Platform

> Six agents. One hire. Zero guesswork.

TryB3 is a multi-agent AI system that automates the entire recruitment 
pipeline — from job intake to candidate shortlisting — using Qwen models 
on Alibaba Cloud infrastructure.

## Tracks

- **Track 3: Agent Society** — Multi-agent collaboration with task division, 
  negotiation, and conflict resolution
- **Track 4: Autopilot Agent** — End-to-end business workflow automation 
  with human-in-the-loop checkpoints

## Architecture

![TryB3 System Architecture](./architecture.png)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| AI Models | Qwen-Max, Qwen-Plus, Qwen-VL (via Qwen Cloud) |
| Database | Alibaba Cloud RDS (PostgreSQL) |
| Vector Memory | Alibaba Cloud AnalyticDB |
| Queue | Alibaba Cloud Redis |
| File Storage | Alibaba Cloud OSS |
| Deployment | Alibaba Cloud ECS |

## Agents

| Agent | Role |
|---|---|
| Intake Agent | Parses job descriptions from text, email, or PDF |
| Market Agent | Researches salary benchmarks and talent supply |
| Sourcing Agent | Scores candidates with full reasoning trace |
| Screening Agent | Multi-turn conversations with persistent memory |
| Conflict Agent | Mediates disagreements between agents |
| Coordinator | Orchestrates the full pipeline |

## Setup

\`\`\`bash
# Frontend
cd apps
npm install
npm run dev

# Backend  
cd api
npm install
npm run dev
\`\`\`

## Environment Variables

\`\`\`env
QWEN_API_KEY=your_key_here
ALIBABA_RDS_URL=your_db_url
ALIBABA_REDIS_URL=your_redis_url
\`\`\`

## License

MIT