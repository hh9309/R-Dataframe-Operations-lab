export type LLMModelId = 'gemini 3 flash' | 'deepseek-v4-pro';

export type LLMProvider = 'google' | 'deepseek';

export interface LLMConfig {
  model: LLMModelId;
  apiKey: string;
  baseUrl?: string;
  provider: LLMProvider;
}

export interface LLMCallResult {
  text: string;
  model: LLMModelId;
  provider: LLMProvider;
  durationMs: number;
}
