import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

const FAL_API_BASE = "https://queue.fal.run";
const REQUEST_TIMEOUT_MS = 30_000;

function falHeaders() {
  const key = process.env.FAL_API_KEY;
  if (!key) throw new Error("FAL_API_KEY is not set");
  return { Authorization: `Key ${key}`, "Content-Type": "application/json" };
}

async function falFetch(path: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${FAL_API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { ...falHeaders(), ...(options.headers as Record<string, string> | undefined) },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

const SubmitBody = z.object({
  model_id: z.string().min(1),
  inputs: z.record(z.unknown()).default({}),
});

const StatusQuery = z.object({
  model_id: z.string().min(1),
  request_id: z.string().min(1),
});

// POST /fal/submit — queue a generation job
router.post("/fal/submit", async (req, res): Promise<void> => {
  const parsed = SubmitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { model_id, inputs } = parsed.data;

  let upstream: Response;
  try {
    upstream = await falFetch(`/${model_id}`, {
      method: "POST",
      body: JSON.stringify(inputs),
    });
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    req.log.error({ err }, "fal.ai submit fetch failed");
    res.status(504).json({ error: isTimeout ? "fal.ai request timed out." : "Failed to reach fal.ai." });
    return;
  }

  const body = await upstream.json() as { request_id?: string; detail?: string; error?: string };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "fal.ai submit error");
    res.status(upstream.status).json({ error: body?.detail ?? body?.error ?? "fal.ai error" });
    return;
  }

  res.status(202).json({ request_id: body.request_id ?? "" });
});

// GET /fal/status — poll status of a queued request
router.get("/fal/status", async (req, res): Promise<void> => {
  const parsed = StatusQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { model_id, request_id } = parsed.data;

  let statusRes: Response;
  try {
    statusRes = await falFetch(`/${model_id}/requests/${request_id}/status?logs=1`);
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    req.log.error({ err }, "fal.ai status fetch failed");
    res.status(504).json({ error: isTimeout ? "fal.ai request timed out." : "Failed to reach fal.ai." });
    return;
  }

  const statusBody = await statusRes.json() as {
    status?: string;
    logs?: { message: string }[];
    detail?: string;
    error?: string;
  };

  if (!statusRes.ok) {
    req.log.error({ status: statusRes.status, statusBody }, "fal.ai status error");
    res.status(statusRes.status).json({ error: statusBody?.detail ?? statusBody?.error ?? "fal.ai error" });
    return;
  }

  const status = statusBody.status ?? "UNKNOWN";

  if (status !== "COMPLETED") {
    res.json({ status, logs: statusBody.logs ?? [] });
    return;
  }

  // Fetch the actual result
  let resultRes: Response;
  try {
    resultRes = await falFetch(`/${model_id}/requests/${request_id}`);
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    req.log.error({ err }, "fal.ai result fetch failed");
    res.status(504).json({ error: isTimeout ? "fal.ai request timed out." : "Failed to reach fal.ai." });
    return;
  }

  const resultBody = await resultRes.json() as {
    images?: { url: string; width?: number; height?: number; content_type?: string }[];
    video?: { url: string };
    videos?: { video: { url: string } }[];
    detail?: string;
    error?: string;
  };

  if (!resultRes.ok) {
    req.log.error({ status: resultRes.status, resultBody }, "fal.ai result error");
    res.status(resultRes.status).json({ error: resultBody?.detail ?? resultBody?.error ?? "fal.ai error" });
    return;
  }

  const images = resultBody.images?.map(img => img.url) ?? [];
  const videoUrl = resultBody.video?.url ?? resultBody.videos?.[0]?.video?.url ?? null;

  res.json({ status: "COMPLETED", images, video_url: videoUrl });
});

export default router;
