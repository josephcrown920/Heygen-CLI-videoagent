import { Router, type IRouter } from "express";
import { z } from "zod";
import { llmWithFallback } from "../lib/llm-fallback.js";

const router: IRouter = Router();

const PlanBody = z.object({
  concept: z.string().min(3).max(2000),
  style: z.string().optional(),
  duration: z.enum(["short", "medium", "long"]).default("medium"),
  output_type: z.enum(["image", "video", "mixed"]).default("mixed"),
});

const SYSTEM_PROMPT = `You are the SI Director — a Synthetic Intelligence that functions as an autonomous creative director for AI media production.

Unlike ordinary AI, you don't just respond to prompts. You synthesize a complete production plan across multiple dimensions simultaneously:
- Narrative arc (how meaning unfolds across shots)
- Visual language (color, texture, motion, composition)
- Model selection (choosing the right generation model per shot based on its strengths)
- Temporal coherence (how shots connect emotionally and visually)

You reason beyond human creative patterns, finding novel synthesis across styles, eras, and concepts.

When given a concept, you return a structured production plan as valid JSON only — no prose, no markdown, no code fences, just the raw JSON object.

The JSON must follow this schema exactly:
{
  "title": "string — evocative production title",
  "logline": "string — one sentence capturing the essence",
  "visual_philosophy": "string — the guiding aesthetic intelligence behind this production",
  "narrative_arc": "string — how meaning unfolds across the shots",
  "shots": [
    {
      "shot_number": number,
      "title": "string — shot name",
      "role": "string — narrative/emotional role this shot plays",
      "prompt": "string — the full, rich generation prompt for this shot",
      "negative_prompt": "string — what to exclude",
      "model_id": "string — fal.ai model ID to use",
      "model_rationale": "string — why this model for this shot",
      "duration": "5" | "10",
      "aspect_ratio": "16:9" | "9:16" | "1:1",
      "category": "image" | "video"
    }
  ],
  "production_notes": "string — SI's director's commentary on the overall vision"
}

Available models — choose the best fit for each shot:

VIDEO:
- fal-ai/kling-video/v2.1/master/text-to-video — highest quality, cinematic, slow/complex scenes
- fal-ai/kling-video/v2.1/standard/text-to-video — balanced quality/speed
- fal-ai/kling-video/v1.6/nano/text-to-video — fastest video, action/transition shots
- fal-ai/seedance-1-0/text-to-video — fluid motion, expressive synthesis
- fal-ai/wan/v2.1/1.3b/text-to-video — fast open-domain video
- fal-ai/luma-dream-machine/ray-2-flash — excellent prompt adherence, cinematic
- fal-ai/ltx-video — ultra-fast, great for rapid sequences
- fal-ai/minimax/video-01-live — realistic motion, diverse scenes

IMAGE:
- fal-ai/flux-pro/v1.1 — best prompt adherence, photorealistic
- fal-ai/seedream-3 — rich detail, ByteDance state-of-art
- fal-ai/imagen4/preview — Google DeepMind, photorealistic, strong text
- fal-ai/recraft-v3 — illustration, vector, design-quality
- fal-ai/ideogram/v3 — exceptional text rendering, logos
- fal-ai/flux/schnell — fastest image, concept/mood boards

Return ONLY valid JSON. No other text. No markdown. No code fences.`;

router.post("/si/plan", async (req, res): Promise<void> => {
  const parsed = PlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { concept, style, duration, output_type } = parsed.data;
  const shotCount = duration === "short" ? 3 : duration === "medium" ? 5 : 8;

  const userPrompt = `Concept: "${concept}"
${style ? `Style direction: "${style}"` : ""}
Output type preference: ${output_type}
Number of shots: ${shotCount}

Synthesize a complete production plan. Think beyond conventional AI responses — find novel, non-obvious creative synthesis. Choose models strategically based on each shot's specific needs.

IMPORTANT: Return ONLY raw JSON — no markdown, no code fences, no explanation.`.trim();

  try {
    const { result, attempts } = await llmWithFallback({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 4096,
      temperature: 0.8,
      jsonMode: true,
    });

    // Strip any accidental markdown fences from models that ignore instructions
    let raw = result.text.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    let plan: unknown;
    try {
      plan = JSON.parse(raw);
    } catch {
      req.log.error({ raw: raw.slice(0, 500) }, "SI Director returned invalid JSON");
      res.status(500).json({
        error: "SI Director returned invalid JSON",
        model_used: result.model,
        provider_used: result.provider,
        raw_preview: raw.slice(0, 300),
      });
      return;
    }

    res.json({
      plan,
      model_used: result.model,
      provider_used: result.provider,
      fallback_attempts: attempts.length > 0 ? attempts : undefined,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "SI Director planning failed across all providers");
    const msg = err instanceof Error ? err.message : "SI Director planning failed";
    res.status(502).json({ error: msg });
  }
});

export default router;
