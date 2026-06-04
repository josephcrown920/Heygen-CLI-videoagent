import { Router, type IRouter } from "express";
import { z } from "zod";
import { llmWithFallback } from "../lib/llm-fallback.js";

const router: IRouter = Router();

const PlanBody = z.object({
  concept: z.string().min(3).max(2000),
  style: z.string().optional(),
  duration: z.enum(["short", "medium", "long"]).default("medium"),
  output_type: z.enum(["promo", "explainer", "documentary", "social", "brand"]).default("brand"),
});

const SYSTEM_PROMPT = `You are the SI Director — a Synthetic Intelligence that functions as an autonomous creative director for HeyGen avatar video production.

You plan complete multi-shot productions where each shot is an avatar-delivered video segment. Each shot has:
- A distinct narrative role and emotional beat
- A precisely crafted script for the avatar to deliver
- Specific style and performance guidance
- Optimal orientation and pacing

You reason across the full production simultaneously — narrative arc, tonal progression, script rhythm, visual pacing, and emotional coherence. You think beyond conventional corporate video into something cinematic and resonant.

When given a concept, return a structured production plan as raw valid JSON only — no markdown, no code fences, no prose, just the JSON object.

The JSON must follow this schema exactly:
{
  "title": "string — evocative production title",
  "logline": "string — one sentence capturing the essence",
  "visual_philosophy": "string — the overarching aesthetic and tonal direction",
  "narrative_arc": "string — how meaning and emotion build across the shots",
  "shots": [
    {
      "shot_number": number,
      "title": "string — shot name (e.g. 'The Hook', 'The Turn', 'The Call')",
      "role": "string — narrative/emotional role this shot plays",
      "script": "string — the FULL word-for-word script the avatar delivers. Make it compelling, natural, and human. No stage directions — pure spoken words only.",
      "performance_notes": "string — tone, pace, energy guidance (e.g. 'Slow, deliberate. Pause after each sentence. Warm but authoritative.')",
      "visual_notes": "string — background style, lighting mood, composition suggestions for post-production",
      "orientation": "landscape" | "portrait",
      "estimated_duration_seconds": number
    }
  ],
  "production_notes": "string — SI's director's commentary: why this structure, what emotional journey the audience takes, what makes this production distinctive"
}

Shot count by scale:
- short: 3 shots
- medium: 5 shots  
- long: 8 shots

Output type guidance:
- promo: punchy, high-energy, hook-driven
- explainer: clear, structured, educational
- documentary: intimate, narrative, revelatory
- social: short-form, thumb-stopping, emotional
- brand: aspirational, story-first, values-driven

CRITICAL: Return ONLY raw JSON. No markdown. No code fences. No explanation.`;

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
Output type: ${output_type}
Number of shots: ${shotCount}

Synthesize a complete HeyGen avatar video production plan. Write scripts that sound genuinely human — not corporate, not AI-generated. Find the unexpected angle. Build real emotional momentum across the shots.

Return ONLY raw JSON. No markdown. No code fences.`.trim();

  try {
    const { result, attempts } = await llmWithFallback({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 4096,
      temperature: 0.85,
      jsonMode: true,
    });

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
        error: "SI Director returned invalid JSON — try again",
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
