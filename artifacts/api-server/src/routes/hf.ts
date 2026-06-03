import { Router, type IRouter } from "express";
import { z } from "zod";
import OpenAI from "openai";

const router: IRouter = Router();

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}

const TextGenBody = z.object({
  model: z.string().default("gpt-4o-mini"),
  prompt: z.string().min(1),
  max_new_tokens: z.number().int().min(1).max(2048).default(512),
  temperature: z.number().min(0).max(2).default(0.7),
});

const EmbedBody = z.object({
  model: z.string().default("text-embedding-3-small"),
  inputs: z.string().or(z.array(z.string())),
});

// POST /hf/text — text generation via OpenAI (HF free tier has no outbound network in this env)
router.post("/hf/text", async (req, res): Promise<void> => {
  const parsed = TextGenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { model, prompt, max_new_tokens, temperature } = parsed.data;
  try {
    const openai = getOpenAI();
    // Map HF model IDs to OpenAI equivalents
    const oaiModel = model.includes("70B") || model.includes("8x7B") ? "gpt-4o" : "gpt-4o-mini";
    const completion = await openai.chat.completions.create({
      model: oaiModel,
      messages: [{ role: "user", content: prompt }],
      max_tokens: max_new_tokens,
      temperature,
    });
    const text = completion.choices[0]?.message?.content ?? "";
    res.json({ text, model: oaiModel, requested_model: model });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI error";
    req.log.error({ err }, "hf text generation failed");
    res.status(500).json({ error: msg });
  }
});

// POST /hf/image — placeholder, use fal.ai for real image gen
router.post("/hf/image", async (req, res): Promise<void> => {
  res.status(503).json({
    error: "HuggingFace image inference not available in this environment. Use POST /api/fal/submit with model_id: 'fal-ai/flux/schnell' instead.",
    suggestion: {
      endpoint: "/api/fal/submit",
      body: { model_id: "fal-ai/flux/schnell", inputs: { prompt: "your prompt", image_size: "square_hd" } },
    },
  });
});

// POST /hf/embed — embeddings via OpenAI
router.post("/hf/embed", async (req, res): Promise<void> => {
  const parsed = EmbedBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { inputs } = parsed.data;
  try {
    const openai = getOpenAI();
    const input = Array.isArray(inputs) ? inputs : [inputs];
    const result = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input,
    });
    const embeddings = result.data.map((d) => d.embedding);
    res.json({ embeddings: embeddings.length === 1 ? embeddings[0] : embeddings, model: "text-embedding-3-small" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Embedding error";
    req.log.error({ err }, "hf embedding failed");
    res.status(500).json({ error: msg });
  }
});

// GET /hf/models — list of curated models
router.get("/hf/models", (_req, res): void => {
  res.json({
    text: [
      { id: "gpt-4o-mini", label: "GPT-4o Mini (fast)", free: false, provider: "openai" },
      { id: "gpt-4o", label: "GPT-4o (powerful)", free: false, provider: "openai" },
      { id: "meta-llama/Llama-3.1-8B-Instruct", label: "Llama 3.1 8B (→ gpt-4o-mini)", free: true, provider: "openai-fallback" },
      { id: "HuggingFaceH4/zephyr-7b-beta", label: "Zephyr 7B (→ gpt-4o-mini)", free: true, provider: "openai-fallback" },
      { id: "microsoft/Phi-3-mini-4k-instruct", label: "Phi-3 Mini (→ gpt-4o-mini)", free: true, provider: "openai-fallback" },
    ],
    image: [
      { id: "fal-ai/flux/schnell", label: "FLUX Schnell (fal.ai)", free: false, provider: "fal" },
      { id: "fal-ai/flux-pro/v1.1", label: "FLUX Pro 1.1 (fal.ai)", free: false, provider: "fal" },
      { id: "fal-ai/stable-diffusion-v3-medium", label: "SD3 Medium (fal.ai)", free: false, provider: "fal" },
    ],
    embed: [
      { id: "text-embedding-3-small", label: "OpenAI Embed Small", free: false, provider: "openai" },
      { id: "text-embedding-3-large", label: "OpenAI Embed Large", free: false, provider: "openai" },
    ],
  });
});

export default router;
