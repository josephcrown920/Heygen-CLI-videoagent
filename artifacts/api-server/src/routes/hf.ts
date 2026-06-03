import { Router, type IRouter } from "express";
import { z } from "zod";
import { HfInference } from "@huggingface/inference";

const router: IRouter = Router();

function getHf() {
  const token = process.env.HUGGINGFACE_TOKEN;
  if (!token) throw new Error("HUGGINGFACE_TOKEN is not set");
  return new HfInference(token);
}

const TextGenBody = z.object({
  model: z.string().default("mistralai/Mistral-7B-Instruct-v0.3"),
  prompt: z.string().min(1),
  max_new_tokens: z.number().int().min(1).max(2048).default(512),
  temperature: z.number().min(0).max(2).default(0.7),
});

const ImageGenBody = z.object({
  model: z.string().default("black-forest-labs/FLUX.1-schnell"),
  prompt: z.string().min(1),
  width: z.number().int().min(256).max(1024).default(512),
  height: z.number().int().min(256).max(1024).default(512),
});

const EmbedBody = z.object({
  model: z.string().default("sentence-transformers/all-MiniLM-L6-v2"),
  inputs: z.string().or(z.array(z.string())),
});

// POST /hf/text — text generation
router.post("/hf/text", async (req, res): Promise<void> => {
  const parsed = TextGenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { model, prompt, max_new_tokens, temperature } = parsed.data;
  try {
    const hf = getHf();
    const result = await hf.textGeneration({
      model,
      inputs: prompt,
      parameters: { max_new_tokens, temperature, return_full_text: false },
    });
    res.json({ text: result.generated_text, model });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "HuggingFace error";
    req.log.error({ err }, "hf text generation failed");
    res.status(500).json({ error: msg });
  }
});

// POST /hf/image — image generation (returns base64)
router.post("/hf/image", async (req, res): Promise<void> => {
  const parsed = ImageGenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { model, prompt, width, height } = parsed.data;
  try {
    const hf = getHf();
    const blob = await hf.textToImage({ model, inputs: prompt, parameters: { width, height } });
    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString("base64");
    const contentType = blob.type || "image/png";
    res.json({ base64, contentType, dataUrl: `data:${contentType};base64,${base64}`, model });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "HuggingFace error";
    req.log.error({ err }, "hf image generation failed");
    res.status(500).json({ error: msg });
  }
});

// POST /hf/embed — feature extraction / embeddings
router.post("/hf/embed", async (req, res): Promise<void> => {
  const parsed = EmbedBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { model, inputs } = parsed.data;
  try {
    const hf = getHf();
    const result = await hf.featureExtraction({ model, inputs: inputs as string });
    res.json({ embeddings: result, model });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "HuggingFace error";
    req.log.error({ err }, "hf embedding failed");
    res.status(500).json({ error: msg });
  }
});

// GET /hf/models — list of curated models by category
router.get("/hf/models", (_req, res): void => {
  res.json({
    text: [
      { id: "mistralai/Mistral-7B-Instruct-v0.3", label: "Mistral 7B Instruct", free: true },
      { id: "meta-llama/Meta-Llama-3-8B-Instruct", label: "Llama 3 8B Instruct", free: true },
      { id: "HuggingFaceH4/zephyr-7b-beta", label: "Zephyr 7B Beta", free: true },
      { id: "microsoft/Phi-3-mini-4k-instruct", label: "Phi-3 Mini 4k", free: true },
    ],
    image: [
      { id: "black-forest-labs/FLUX.1-schnell", label: "FLUX Schnell", free: true },
      { id: "stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL Base 1.0", free: true },
      { id: "runwayml/stable-diffusion-v1-5", label: "SD 1.5", free: true },
    ],
    embed: [
      { id: "sentence-transformers/all-MiniLM-L6-v2", label: "MiniLM-L6-v2", free: true },
      { id: "BAAI/bge-small-en-v1.5", label: "BGE Small EN", free: true },
    ],
  });
});

export default router;
