"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDB = initDB;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.db = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
async function initDB() {
    await exports.db.query(`
    CREATE TABLE IF NOT EXISTS pipelines (
      id VARCHAR PRIMARY KEY,
      job_description TEXT NOT NULL,
      job_spec JSONB,
      market_intelligence JSONB,
      current_stage VARCHAR DEFAULT 'intake',
      requires_human_approval BOOLEAN DEFAULT false,
      human_approval_reason TEXT,
      log JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id VARCHAR PRIMARY KEY,
      pipeline_id VARCHAR REFERENCES pipelines(id),
      name VARCHAR NOT NULL,
      email VARCHAR,
      profile TEXT,
      score INTEGER,
      confidence INTEGER,
      reasoning_trace JSONB DEFAULT '[]',
      strengths JSONB DEFAULT '[]',
      gaps JSONB DEFAULT '[]',
      recommendation VARCHAR,
      stage VARCHAR DEFAULT 'sourced',
      flagged BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS screening_sessions (
      id SERIAL PRIMARY KEY,
      candidate_id VARCHAR NOT NULL,
      messages JSONB DEFAULT '[]',
      memories JSONB DEFAULT '[]',
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS agent_decisions (
      id SERIAL PRIMARY KEY,
      pipeline_id VARCHAR REFERENCES pipelines(id),
      agent_name VARCHAR NOT NULL,
      decision TEXT,
      reasoning TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
    console.log("✓ Database tables ready");
}
