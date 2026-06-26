"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCoordinatorAgent = runCoordinatorAgent;
// import { callQwen } from "../services/qwenService";
const intakeAgent_1 = require("./intakeAgent");
const marketAgent_1 = require("./marketAgent");
async function runCoordinatorAgent(state) {
    console.log(`[CoordinatorAgent] Pipeline ${state.id} — stage: ${state.currentStage}`);
    state.log.push(`[${new Date().toISOString()}] Coordinator: stage=${state.currentStage}`);
    switch (state.currentStage) {
        case "intake": {
            state.log.push("Coordinator: Dispatching Intake Agent");
            try {
                state.jobSpec = await (0, intakeAgent_1.runIntakeAgent)(state.jobDescription);
                state.log.push(`Coordinator: Intake complete — ${state.jobSpec.title} (${state.jobSpec.seniority})`);
                state.log.push(`Coordinator: Skills identified — ${state.jobSpec.requiredSkills.join(", ")}`);
                state.currentStage = "market";
                // Continue to next stage automatically
                return runCoordinatorAgent(state);
            }
            catch (err) {
                state.log.push(`Coordinator: Intake Agent failed — ${err}`);
                return state;
            }
        }
        case "market": {
            state.log.push("Coordinator: Dispatching Market Intelligence Agent");
            try {
                if (!state.jobSpec)
                    throw new Error("No job spec available");
                state.marketIntelligence = await (0, marketAgent_1.runMarketAgent)(state.jobSpec);
                state.log.push(`Coordinator: Market research complete — talent supply is ${state.marketIntelligence.talentSupply}`);
                state.log.push(`Coordinator: Salary range ${state.marketIntelligence.salaryRange.min}-${state.marketIntelligence.salaryRange.max} ${state.marketIntelligence.salaryRange.currency}`);
                state.currentStage = "sourcing";
                state.requiresHumanApproval = true;
                state.humanApprovalReason =
                    "Market research complete — approve to begin candidate sourcing";
                return state;
            }
            catch (err) {
                state.log.push(`Coordinator: Market Agent failed — ${err}`);
                return state;
            }
        }
        case "sourcing": {
            state.log.push("Coordinator: Sourcing Agent will score candidates as they are submitted");
            state.currentStage = "screening";
            return state;
        }
        case "screening": {
            state.log.push("Coordinator: Screening Agent active — processing candidate conversations");
            return state;
        }
        default:
            return state;
    }
}
