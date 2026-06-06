/**
 * LLM Fallback Chain
 *
 * Tries providers in priority order, falling back on error or missing keys.
 *
 * Priority:
 *  1. Google Gemini 2.0 Flash   (GOOGLE_AI_API_KEY — fastest, best quality)
 *  2. Cerebras GPT-OSS 120B     (HF_TOKEN — free, fast)
 *  3. Cerebras ZAI-GLM 4.7      (HF_TOKEN — free fallback)
 *  4. OpenAI GPT-4o Mini        (OPENAI_API_KEY)
 *  5. OpenAI GPT-4o             (OPENAI_API_KEY — final fallback)
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResult {
  text: string;
  model: string;
  provider: "gemini" | "huggingface" | "openai";
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
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/openai";
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

export const GEMINI_MODELS = [
  { model: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { model: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
];

export const FREE_HF_MODELS: HFModel[] = [
  { provider: "cerebras", model: "gpt-oss-120b", label: "Cerebras GPT-OSS 120B" },
  { provider: "cerebras", model: "zai-glm-4.7", label: "Cerebras ZAI-GLM 4.7" },
];

export const OPENAI_MODELS: OAIModel[] = [
  { model: "gpt-4o-mini", label: "GPT-4o Mini" },
  { model: "gpt-4o", label: "GPT-4o" },
];

async function tryOpenAICompat(
  baseUrl: string,
  modelId: string,
  apiKey: string,
  messages: LLMMessage[],
  maxTokens: number,
  temperature: number,
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

    const res = await fetch(`${baseUrl}/chat/completions`, {
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
      choices?: { message?: { content?: string } }[];
      error?: string;
    };

    if (data.error) throw new Error(data.error);

    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("Empty content in response");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Try Gemini → HuggingFace/Cerebras → OpenAI with automatic fallback.
 */
export async function llmWithFallback(opts: FallbackOptions): Promise<FallbackResponse> {
  const {
    messages,
    maxTokens = 1024,
    temperature = 0.7,
    jsonMode = false,
  } = opts;

  const googleKey = process.env.GOOGLE_AI_API_KEY;
  const hfToken = process.env.HF_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;
  const attempts: FallbackLog[] = [];

  // 1. Gemini (fastest, best quality)
  if (googleKey) {
    for (const m of GEMINI_MODELS) {
      try {
        const text = await tryOpenAICompat(GEMINI_API_BASE, m.model, googleKey, messages, maxTokens, temperature, jsonMode);
        return { result: { text, model: m.model, provider: "gemini" }, attempts };
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        attempts.push({ model: m.model, provider: "gemini", error });
      }
    }
  } else {
    attempts.push({ model: "gemini", provider: "gemini", error: "GOOGLE_AI_API_KEY not set — skipping" });
  }

  // 2. HuggingFace Router (Cerebras — free)
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

  // 3. OpenAI (paid fallback)
  if (openaiKey) {
    for (const entry of OPENAI_MODELS) {
      try {
        const text = await tryOpenAICompat(OPENAI_API_BASE, entry.model, openaiKey, messages, maxTokens, temperature, jsonMode);
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
