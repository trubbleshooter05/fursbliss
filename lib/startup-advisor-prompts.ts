const DEFAULT_IDEA =
  "Dog health tracking app for senior dogs preparing for LOY-002. Daily logs, AI supplement recommendations, vet-ready reports.";

export type StartupAdvisorMode = "pain_points" | "acquisition" | "revenue";

export function getStartupAdvisorPrompt(
  mode: StartupAdvisorMode,
  businessIdea: string
): { system: string; user: string } {
  const idea = businessIdea.trim() || DEFAULT_IDEA;

  switch (mode) {
    case "pain_points":
      return {
        system:
          "You are a market researcher. Identify customer pain points, current solutions, and willingness to pay. Be specific and actionable.",
        user: `For the business idea: ${idea}

Identify the top problems or frustrations the target customers face. Explain why these problems exist, how people currently try to solve them, and what kind of solution customers would be willing to pay for.`,
      };
    case "acquisition":
      return {
        system:
          "You are a growth strategist. Create step-by-step plans focused on organic, no-ad strategies.",
        user: `For the startup idea: ${idea}

Create a step-by-step plan to get the first 50-100 customers without spending money on ads. Focus on organic strategies like communities, social media, partnerships, and direct outreach.`,
      };
    case "revenue":
      return {
        system:
          "You are a monetization advisor. Suggest pricing, early offers, and conversion tactics.",
        user: `For this startup idea: ${idea}

Design a simple monetization strategy that can start generating revenue quickly. Suggest pricing options, early offers, and practical ways to convert early users or interest into paying customers.`,
      };
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}
