// import { callQwen } from "../services/qwenService";
import { JobSpec, runIntakeAgent } from "./intakeAgent";
import { runMarketAgent, MarketIntelligence } from "./marketAgent";

export type PipelineStage =
  | "intake"
  | "market"
  | "sourcing"
  | "screening"
  | "conflict"
  | "completed";

export interface PipelineState {
  id: string;
  jobDescription: string;
  jobSpec?: JobSpec;
  marketIntelligence?: MarketIntelligence;
  currentStage: PipelineStage;
  requiresHumanApproval: boolean;
  humanApprovalReason?: string;
  log: string[];
}

export async function runCoordinatorAgent(
  state: PipelineState,
): Promise<PipelineState> {
  console.log(
    `[CoordinatorAgent] Pipeline ${state.id} — stage: ${state.currentStage}`,
  );

  state.log.push(
    `[${new Date().toISOString()}] Coordinator: stage=${state.currentStage}`,
  );

  switch (state.currentStage) {
    case "intake": {
      state.log.push("Coordinator: Dispatching Intake Agent");
      try {
        state.jobSpec = await runIntakeAgent(state.jobDescription);
        state.log.push(
          `Coordinator: Intake complete — ${state.jobSpec.title} (${state.jobSpec.seniority})`,
        );
        state.log.push(
          `Coordinator: Skills identified — ${state.jobSpec.requiredSkills.join(", ")}`,
        );
        state.currentStage = "market";

        // Continue to next stage automatically
        return runCoordinatorAgent(state);
      } catch (err) {
        state.log.push(`Coordinator: Intake Agent failed — ${err}`);
        return state;
      }
    }

    case "market": {
      state.log.push("Coordinator: Dispatching Market Intelligence Agent");
      try {
        if (!state.jobSpec) throw new Error("No job spec available");
        state.marketIntelligence = await runMarketAgent(state.jobSpec);
        state.log.push(
          `Coordinator: Market research complete — talent supply is ${state.marketIntelligence.talentSupply}`,
        );
        state.log.push(
          `Coordinator: Salary range ${state.marketIntelligence.salaryRange.min}-${state.marketIntelligence.salaryRange.max} ${state.marketIntelligence.salaryRange.currency}`,
        );
        state.currentStage = "sourcing";
        state.requiresHumanApproval = true;
        state.humanApprovalReason =
          "Market research complete — approve to begin candidate sourcing";
        return state;
      } catch (err) {
        state.log.push(`Coordinator: Market Agent failed — ${err}`);
        return state;
      }
    }

    case "sourcing": {
      state.log.push(
        "Coordinator: Sourcing Agent active — candidates being scored",
      );
      // After human proceeds from sourcing
      state.currentStage = "screening";
      state.requiresHumanApproval = false;
      state.log.push("Coordinator: Moving to screening phase");
      return state;
    }

    case "screening": {
      state.log.push(
        "Coordinator: Screening Agent active — conducting candidate interviews",
      );
      state.requiresHumanApproval = true;
      state.humanApprovalReason =
        "Screening complete — approve final shortlist";
      return state;
    }

    default:
      return state;
  }
}
