export type ModelPricing = {
  inputPerMillion: number;
  outputPerMillion: number;
};

const DEFAULT_MODEL_PRICING: Record<string, ModelPricing> = {
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gpt-4.1-mini": { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  "gpt-4o": { inputPerMillion: 5, outputPerMillion: 15 },
};

export function estimateTokensFromText(text: string) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function getModelPricing(model: string): ModelPricing {
  const normalized = model.trim();
  const fromDefault =
    DEFAULT_MODEL_PRICING[normalized] ?? DEFAULT_MODEL_PRICING["gpt-4o-mini"];

  const overrideInput = Number(process.env.OPENAI_COST_INPUT_PER_MILLION_USD);
  const overrideOutput = Number(process.env.OPENAI_COST_OUTPUT_PER_MILLION_USD);

  if (Number.isFinite(overrideInput) && Number.isFinite(overrideOutput)) {
    return { inputPerMillion: overrideInput, outputPerMillion: overrideOutput };
  }

  return fromDefault;
}

export function estimateUsdCost(params: {
  model: string;
  inputTokens: number;
  outputTokens: number;
}) {
  const pricing = getModelPricing(params.model);
  const inputCost = (params.inputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (params.outputTokens / 1_000_000) * pricing.outputPerMillion;
  return inputCost + outputCost;
}
