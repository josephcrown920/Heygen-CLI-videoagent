import { Router, type IRouter } from "express";
import { z } from "zod";
import { llmWithFallback, FREE_HF_MODELS, OPENAI_MODELS } from "../lib/llm-fallback.js";

const router: IRouter = Router();

const TextGenBody = z.object({
  model: z.string().optional(),
  prompt: z.string().min(1),
  max_new_tokens: z.number().int().min(1).max(4096).default(512),
  temperature: z.number().min(0).max(2).default(0.7),
  system: z.string().optional(),
});

const EmbedBody = z.object({
  model: z.string().default("text-embedding-3-small"),
  inputs: z.string().or(z.array(z.string())),
});

// POST /hf/text — text generation with free HF fallback chain, then OpenAI
router.post("/hf/text", async (req, res): Promise<void> => {
  const parsed = TextGenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { prompt, max_new_tokens, temperature, system, model } = parsed.data;

  const messages: { role: "system" | "user"; content: string }[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  try {
    const { result, attempts } = await llmWithFallback({
      messages,
      maxTokens: max_new_tokens,
      temperature,
      preferModel: model,
    });

    res.json({
      text: result.text,
      model: result.model,
      provider: result.provider,
      requested_model: model ?? null,
      fallback_attempts: attempts.length > 0 ? attempts : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "All LLM providers failed";
    req.log.error({ err }, "hf text generation failed across all providers");
    res.status(502).json({ error: msg });
  }
});

// POST /hf/image — placeholder, direct users to HeyGen
router.post("/hf/image", async (req, res): Promise<void> => {
  res.status(503).json({
    error: "Image generation is not configured. Use HeyGen for avatar video creation.",
  });
});

// POST /hf/embed — embeddings via OpenAI (HF embed models need paid tier)
router.post("/hf/embed", async (req, res): Promise<void> => {
  const parsed = EmbedBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { inputs } = parsed.data;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY is not set — required for embeddings" });
    return;
  }

  try {
    const input = Array.isArray(inputs) ? inputs : [inputs];
    const res2 = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "text-embedding-3-small", input }),
    });

    if (!res2.ok) {
      const errText = await res2.text();
      throw new Error(`OpenAI embeddings HTTP ${res2.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res2.json() as { data: { embedding: number[] }[] };
    const embeddings = data.data.map((d) => d.embedding);
    res.json({
      embeddings: embeddings.length === 1 ? embeddings[0] : embeddings,
      model: "text-embedding-3-small",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Embedding error";
    req.log.error({ err }, "hf embedding failed");
    res.status(500).json({ error: msg });
  }
});

// GET /hf/models — list all available models with provider info
router.get("/hf/models", (_req, res): void => {
  res.json({
    text: [
      ...FREE_HF_MODELS.map((m) => ({
        id: m.model,
        label: m.label,
        free: true,
        provider: "huggingface",
        priority: "primary",
      })),
      ...OPENAI_MODELS.map((m) => ({
        id: m.model,
        label: m.label,
        free: false,
        provider: "openai",
        priority: "fallback",
      })),
    ],
    embed: [
      { id: "text-embedding-3-small", label: "OpenAI Embed Small", free: false, provider: "openai" },
    ],
    fallback_order: "HuggingFace free models → OpenAI (if all HF fail)",
  });
});

export default router;
