/**
 * LLM Fallback Chain
 * Tries free HuggingFace Inference models in order, then falls back to OpenAI.
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResult {
  text: string;
  model: string;
  provider: "huggingface" | "openai";
}

interface ModelEntry {
  id: string;
  provider: "huggingface" | "openai";
  label: string;
}

const HF_API_BASE = "https://api-inference.huggingface.co/models";
const HF_TIMEOUT_MS = 30_000;
const OPENAI_API_BASE = "https://api.openai.com/v1";
const OPENAI_TIMEOUT_MS = 30_000;

export const FREE_HF_MODELS: ModelEntry[] = [
  { id: "Qwen/Qwen2.5-72B-Instruct", provider: "huggingface", label: "Qwen 2.5 72B" },
  { id: "meta-llama/Llama-3.3-70B-Instruct", provider: "huggingface", label: "Llama 3.3 70B" },
  { id: "mistralai/Mistral-7B-Instruct-v0.3", provider: "huggingface", label: "Mistral 7B" },
  { id: "HuggingFaceH4/zephyr-7b-beta", provider: "huggingface", label: "Zephyr 7B" },
  { id: "microsoft/Phi-3-mini-4k-instruct", provider: "huggingface", label: "Phi-3 Mini" },
  { id: "google/gemma-2-2b-it", provider: "huggingface", label: "Gemma 2 2B" },
];

export const OPENAI_MODELS: ModelEntry[] = [
  { id: "gpt-4o-mini", provider: "openai", label: "GPT-4o Mini" },
  { id: "gpt-4o", provider: "openai", label: "GPT-4o" },
];

async function tryHuggingFace(
  modelId: string,
  messages: LLMMessage[],
  maxTokens: number,
  temperature: number,
  hfToken: string
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HF_TIMEOUT_MS);

  try {
    const res = await fetch(`${HF_API_BASE}/${modelId}/v1/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        max_tokens: maxTokens,
        temperature,
        stream: false,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HF ${modelId} → HTTP ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json() as {
      choices?: { message?: { content?: string } }[];
      error?: string;
    };

    if (data.error) throw new Error(`HF ${modelId} error: ${data.error}`);

    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error(`HF ${modelId} returned empty content`);
    return text;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error(`HF ${modelId} timed out`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function tryOpenAI(
  modelId: string,
  messages: LLMMessage[],
  maxTokens: number,
  temperature: number,
  apiKey: string,
  jsonMode = false
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const body: Record<string, unknown> = {
      model: modelId,
      messages,
      max_tokens: maxTokens,
      temperature,
    };
    if (jsonMode) body.response_format = { type: "json_object" };

    const res = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`OpenAI ${modelId} → HTTP ${res.status}: ${errBody.slice(0, 300)}`);
    }

    const data = await res.json() as {
      choices?: { message?: { content?: string } }[];
    };

    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error(`OpenAI ${modelId} returned empty content`);
    return text;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error(`OpenAI ${modelId} timed out`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export interface FallbackOptions {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
  preferModel?: string;
}

export interface FallbackLog {
  model: string;
  provider: string;
  error: string;
}

export interface FallbackResponse {
  result: LLMResult;
  attempts: FallbackLog[];
}

/**
 * Try HuggingFace free models first, then OpenAI as final fallback.
 * Returns the first successful result.
 */
export async function llmWithFallback(opts: FallbackOptions): Promise<FallbackResponse> {
  const {
    messages,
    maxTokens = 512,
    temperature = 0.7,
    jsonMode = false,
  } = opts;

  const hfToken = process.env.HF_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;
  const attempts: FallbackLog[] = [];

  if (hfToken) {
    for (const model of FREE_HF_MODELS) {
      try {
        const text = await tryHuggingFace(model.id, messages, maxTokens, temperature, hfToken);
        if (text) {
          return {
            result: { text, model: model.id, provider: "huggingface" },
            attempts,
          };
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        attempts.push({ model: model.id, provider: "huggingface", error });
      }
    }
  } else {
    attempts.push({ model: "all-hf", provider: "huggingface", error: "HF_TOKEN not set, skipping" });
  }

  if (openaiKey) {
    for (const model of OPENAI_MODELS) {
      try {
        const text = await tryOpenAI(model.id, messages, maxTokens, temperature, openaiKey, jsonMode);
        if (text) {
          return {
            result: { text, model: model.id, provider: "openai" },
            attempts,
          };
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        attempts.push({ model: model.id, provider: "openai", error });
      }
    }
  } else {
    attempts.push({ model: "all-openai", provider: "openai", error: "OPENAI_API_KEY not set, skipping" });
  }

  const summary = attempts.map((a) => `[${a.provider}/${a.model}]: ${a.error}`).join(" | ");
  throw new Error(`All LLM providers failed. Attempts: ${summary}`);
}
