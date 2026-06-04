/**
 * LLM Fallback Chain
 * Tries free HuggingFace Router models in order, then falls back to OpenAI.
 *
 * Tested working providers (via router.huggingface.co):
 *  - cerebras: gpt-oss-120b, zai-glm-4.7   (fast reasoning models, free)
 *
 * Fallback order: cerebras/gpt-oss-120b → cerebras/zai-glm-4.7 → openai/gpt-4o-mini → openai/gpt-4o
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

export interface FallbackLog {
  model: string;
  provider: string;
  error: string;
}

export interface FallbackResponse {
  result: LLMResult;
  attempts: FallbackLog[];
}

export interface FallbackOptions {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

const HF_ROUTER_BASE = "https://router.huggingface.co";
const OPENAI_API_BASE = "https://api.openai.com/v1";
const TIMEOUT_MS = 45_000;

interface HFModel {
  provider: string;
  model: string;
  label: string;
}

interface OAIModel {
  model: string;
  label: string;
}

export const FREE_HF_MODELS: HFModel[] = [
  { provider: "cerebras", model: "gpt-oss-120b", label: "Cerebras GPT-OSS 120B" },
  { provider: "cerebras", model: "zai-glm-4.7", label: "Cerebras ZAI-GLM 4.7" },
];

export const OPENAI_MODELS: OAIModel[] = [
  { model: "gpt-4o-mini", label: "GPT-4o Mini" },
  { model: "gpt-4o", label: "GPT-4o" },
];

async function tryHFRouter(
  entry: HFModel,
  messages: LLMMessage[],
  maxTokens: number,
  temperature: number,
  hfToken: string
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${HF_ROUTER_BASE}/${entry.provider}/v1/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: entry.model,
        messages,
        max_tokens: maxTokens,
        temperature,
        stream: false,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
    }

    const data = await res.json() as {
      choices?: { message?: { content?: string; reasoning?: string } }[];
      error?: string;
    };

    if (data.error) throw new Error(data.error);

    const msg = data.choices?.[0]?.message;
    const text = msg?.content ?? "";
    if (!text.trim()) {
      throw new Error("Empty content in response");
    }
    return text;
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
  jsonMode: boolean
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

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
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`);
    }

    const data = await res.json() as {
      choices?: { message?: { content?: string } }[];
    };

    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("Empty content in response");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Try free HF Router models first (cerebras), then OpenAI as fallback.
 */
export async function llmWithFallback(opts: FallbackOptions): Promise<FallbackResponse> {
  const {
    messages,
    maxTokens = 1024,
    temperature = 0.7,
    jsonMode = false,
  } = opts;

  const hfToken = process.env.HF_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;
  const attempts: FallbackLog[] = [];

  if (hfToken) {
    for (const entry of FREE_HF_MODELS) {
      try {
        const text = await tryHFRouter(entry, messages, maxTokens, temperature, hfToken);
        return {
          result: { text, model: entry.model, provider: "huggingface" },
          attempts,
        };
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        attempts.push({ model: `${entry.provider}/${entry.model}`, provider: "huggingface", error });
      }
    }
  } else {
    attempts.push({ model: "all-hf", provider: "huggingface", error: "HF_TOKEN not set — skipping" });
  }

  if (openaiKey) {
    for (const entry of OPENAI_MODELS) {
      try {
        const text = await tryOpenAI(entry.model, messages, maxTokens, temperature, openaiKey, jsonMode);
        return {
          result: { text, model: entry.model, provider: "openai" },
          attempts,
        };
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        attempts.push({ model: entry.model, provider: "openai", error });
      }
    }
  } else {
    attempts.push({ model: "all-openai", provider: "openai", error: "OPENAI_API_KEY not set — skipping" });
  }

  const summary = attempts.map((a) => `[${a.provider}/${a.model}]: ${a.error}`).join(" | ");
  throw new Error(`All LLM providers failed. ${summary}`);
}
