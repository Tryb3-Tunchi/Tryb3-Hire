This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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

| Agent       | Model     | Role                                            |
| ----------- | --------- | ----------------------------------------------- |
| Intake      | Qwen-Max  | Parses job descriptions to structured JSON      |
| Market      | Qwen-Max  | Researches salary benchmarks and talent supply  |
| Sourcing    | Qwen-Max  | Scores candidates with full reasoning trace     |
| Screening   | Qwen-Plus | Multi-turn conversations with persistent memory |
| Conflict    | Qwen-Max  | Mediates disagreements between agents           |
| Coordinator | Qwen-Max  | Orchestrates the full pipeline                  |

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | Next.js 14, Tailwind CSS, Framer Motion |
| Backend    | Node.js, Express, TypeScript            |
| AI         | Qwen-Max, Qwen-Plus via Qwen Cloud      |
| Database   | Alibaba Cloud RDS PostgreSQL            |
| Memory     | Alibaba Cloud AnalyticDB Vector DB      |
| Queue      | Alibaba Cloud Redis                     |
| Storage    | Alibaba Cloud OSS                       |
| Deployment | Alibaba Cloud ECS                       |

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
