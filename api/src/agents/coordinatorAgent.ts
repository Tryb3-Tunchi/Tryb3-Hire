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
        // Stay at market stage — wait for human approval before sourcing
        state.currentStage = "market";
        state.requiresHumanApproval = true;
        state.humanApprovalReason =
          "Review market findings — approve to begin candidate sourcing";
        return state;
      } catch (err) {
        state.log.push(`Coordinator: Market Agent failed — ${err}`);
        return state;
      }
    }

    case "sourcing": {
      state.log.push(
        "Coordinator: Sourcing Agent active — awaiting candidate scoring",
      );
      state.requiresHumanApproval = true;
      state.humanApprovalReason =
        "Score candidates, then approve to move to screening";
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

    case "completed": {
      state.log.push("Coordinator: Pipeline completed — all agents finished");
      state.requiresHumanApproval = false;
      return state;
    }

    default:
      return state;
  }
}
