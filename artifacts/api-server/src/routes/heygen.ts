import { Router, type IRouter } from "express";
import {
  ListAvatarLooksQueryParams,
  ListVoicesQueryParams,
  ListVideosQueryParams,
  CreateVideoBody,
  GetVideoParams,
  DeleteVideoParams,
  CreateVideoFromPromptBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const HEYGEN_API_BASE = "https://api.heygen.com";
const REQUEST_TIMEOUT_MS = 30_000;

function heygenHeaders() {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) throw new Error("HEYGEN_API_KEY is not set");
  return {
    "X-Api-Key": apiKey,
    "Content-Type": "application/json",
  };
}

async function heygenFetch(path: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${HEYGEN_API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...heygenHeaders(),
        ...(options.headers as Record<string, string> | undefined),
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function extractError(body: { error?: { message?: string; code?: string | number } | string; message?: string }): string {
  if (typeof body.error === "string") return body.error;
  if (body.error?.message) return body.error.message;
  if (body.message) return body.message;
  return "An unexpected error occurred with HeyGen.";
}

function handleCatchError(err: unknown, res: ReturnType<typeof Router>["use"] extends never ? never : Parameters<Parameters<ReturnType<typeof Router>["use"]>[0]>[1], label: string, req: Parameters<Parameters<ReturnType<typeof Router>["use"]>[0]>[0]): void {
  const msg = err instanceof Error ? err.message : String(err);
  const isTimeout = err instanceof Error && err.name === "AbortError";
  const isMissingKey = msg.includes("not set");
  (req as { log: { error: (obj: object, msg: string) => void } }).log.error({ err }, label);
  (res as { status: (n: number) => { json: (o: object) => void } })
    .status(isMissingKey ? 500 : isTimeout ? 504 : 502)
    .json({ error: isMissingKey ? msg : isTimeout ? "HeyGen request timed out." : "Failed to reach HeyGen." });
}

// GET /avatars — list avatar looks
router.get("/avatars", async (req, res): Promise<void> => {
  const parsed = ListAvatarLooksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const params = new URLSearchParams();
  if (parsed.data.limit != null) params.set("limit", String(parsed.data.limit));
  if (parsed.data.token) params.set("token", parsed.data.token);
  if (parsed.data.ownership) params.set("ownership", parsed.data.ownership);

  const qs = params.toString() ? `?${params.toString()}` : "";

  let upstream: Response;
  try {
    upstream = await heygenFetch(`/v3/avatars/looks${qs}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    const isMissingKey = msg.includes("not set");
    req.log.error({ err }, "HeyGen avatars fetch failed");
    res.status(isMissingKey ? 500 : isTimeout ? 504 : 502).json({ error: isMissingKey ? msg : isTimeout ? "HeyGen request timed out." : "Failed to reach HeyGen." });
    return;
  }

  const body = await upstream.json() as {
    data?: { looks?: unknown[]; next_token?: string | null };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen avatars error");
    res.status(upstream.status).json({ error: extractError(body) });
    return;
  }

  res.json({
    avatars: body?.data?.looks ?? [],
    next_token: body?.data?.next_token ?? null,
  });
});

// GET /voices — list voices
router.get("/voices", async (req, res): Promise<void> => {
  const parsed = ListVoicesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const params = new URLSearchParams();
  if (parsed.data.limit != null) params.set("limit", String(parsed.data.limit));
  if (parsed.data.token) params.set("token", parsed.data.token);
  if (parsed.data.language) params.set("language", parsed.data.language);
  if (parsed.data.gender) params.set("gender", parsed.data.gender);

  const qs = params.toString() ? `?${params.toString()}` : "";

  let upstream: Response;
  try {
    upstream = await heygenFetch(`/v3/voices${qs}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    const isMissingKey = msg.includes("not set");
    req.log.error({ err }, "HeyGen voices fetch failed");
    res.status(isMissingKey ? 500 : isTimeout ? 504 : 502).json({ error: isMissingKey ? msg : isTimeout ? "HeyGen request timed out." : "Failed to reach HeyGen." });
    return;
  }

  const body = await upstream.json() as {
    data?: { voices?: unknown[]; next_token?: string | null };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen voices error");
    res.status(upstream.status).json({ error: extractError(body) });
    return;
  }

  res.json({
    voices: body?.data?.voices ?? [],
    next_token: body?.data?.next_token ?? null,
  });
});

// GET /videos — list videos
router.get("/videos", async (req, res): Promise<void> => {
  const parsed = ListVideosQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const params = new URLSearchParams();
  if (parsed.data.limit != null) params.set("limit", String(parsed.data.limit));
  if (parsed.data.token) params.set("token", parsed.data.token);

  const qs = params.toString() ? `?${params.toString()}` : "";

  let upstream: Response;
  try {
    upstream = await heygenFetch(`/v3/videos${qs}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    const isMissingKey = msg.includes("not set");
    req.log.error({ err }, "HeyGen videos fetch failed");
    res.status(isMissingKey ? 500 : isTimeout ? 504 : 502).json({ error: isMissingKey ? msg : isTimeout ? "HeyGen request timed out." : "Failed to reach HeyGen." });
    return;
  }

  const body = await upstream.json() as {
    data?: { videos?: unknown[]; next_token?: string | null };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen videos error");
    res.status(upstream.status).json({ error: extractError(body) });
    return;
  }

  res.json({
    videos: body?.data?.videos ?? [],
    next_token: body?.data?.next_token ?? null,
  });
});

// POST /videos/agent — create video from prompt (must be before /videos/:videoId)
router.post("/videos/agent", async (req, res): Promise<void> => {
  const parsed = CreateVideoFromPromptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const payload: Record<string, unknown> = {
    prompt: parsed.data.prompt,
    mode: "generate",
    orientation: parsed.data.orientation ?? "landscape",
  };
  if (parsed.data.avatar_id) payload.avatar_id = parsed.data.avatar_id;
  if (parsed.data.voice_id) payload.voice_id = parsed.data.voice_id;

  let upstream: Response;
  try {
    upstream = await heygenFetch("/v3/video-agents", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    const isMissingKey = msg.includes("not set");
    req.log.error({ err }, "HeyGen video agent fetch failed");
    res.status(isMissingKey ? 500 : isTimeout ? 504 : 502).json({ error: isMissingKey ? msg : isTimeout ? "HeyGen request timed out." : "Failed to reach HeyGen." });
    return;
  }

  const body = await upstream.json() as {
    data?: { session_id?: string; video_id?: string; status?: string };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen video agent error");
    res.status(upstream.status).json({ error: extractError(body) });
    return;
  }

  res.status(201).json({
    video_id: body?.data?.video_id ?? body?.data?.session_id ?? "",
    session_id: body?.data?.session_id ?? null,
    status: body?.data?.status ?? "pending",
  });
});

// POST /videos — create a video
router.post("/videos", async (req, res): Promise<void> => {
  const parsed = CreateVideoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const payload = {
    type: "avatar",
    avatar_id: parsed.data.avatar_id,
    voice_id: parsed.data.voice_id,
    script: parsed.data.script,
    title: parsed.data.title ?? undefined,
    orientation: parsed.data.orientation ?? "landscape",
  };

  let upstream: Response;
  try {
    upstream = await heygenFetch("/v3/videos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    const isMissingKey = msg.includes("not set");
    req.log.error({ err }, "HeyGen create video fetch failed");
    res.status(isMissingKey ? 500 : isTimeout ? 504 : 502).json({ error: isMissingKey ? msg : isTimeout ? "HeyGen request timed out." : "Failed to reach HeyGen." });
    return;
  }

  const body = await upstream.json() as {
    data?: { video_id?: string; session_id?: string; status?: string };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen create video error");
    res.status(upstream.status).json({ error: extractError(body) });
    return;
  }

  res.status(201).json({
    video_id: body?.data?.video_id ?? "",
    session_id: body?.data?.session_id ?? null,
    status: body?.data?.status ?? "pending",
  });
});

// GET /videos/:videoId — get video status
router.get("/videos/:videoId", async (req, res): Promise<void> => {
  const params = GetVideoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let upstream: Response;
  try {
    upstream = await heygenFetch(`/v3/videos/${params.data.videoId}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    const isMissingKey = msg.includes("not set");
    req.log.error({ err }, "HeyGen get video fetch failed");
    res.status(isMissingKey ? 500 : isTimeout ? 504 : 502).json({ error: isMissingKey ? msg : isTimeout ? "HeyGen request timed out." : "Failed to reach HeyGen." });
    return;
  }

  const body = await upstream.json() as {
    data?: {
      video_id?: string;
      id?: string;
      status?: string;
      title?: string | null;
      video_url?: string | null;
      thumbnail_url?: string | null;
      duration?: number | null;
      created_at?: number | null;
      error?: string | null;
    };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen get video error");
    res.status(upstream.status).json({ error: extractError(body) });
    return;
  }

  const d = body?.data;
  res.json({
    id: d?.video_id ?? d?.id ?? params.data.videoId,
    status: d?.status ?? "unknown",
    title: d?.title ?? null,
    video_url: d?.video_url ?? null,
    thumbnail_url: d?.thumbnail_url ?? null,
    duration: d?.duration ?? null,
    created_at: d?.created_at ?? null,
    error: d?.error ?? null,
  });
});

// DELETE /videos/:videoId — delete a video
router.delete("/videos/:videoId", async (req, res): Promise<void> => {
  const params = DeleteVideoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let upstream: Response;
  try {
    upstream = await heygenFetch(`/v3/videos/${params.data.videoId}`, {
      method: "DELETE",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    const isMissingKey = msg.includes("not set");
    req.log.error({ err }, "HeyGen delete video fetch failed");
    res.status(isMissingKey ? 500 : isTimeout ? 504 : 502).json({ error: isMissingKey ? msg : isTimeout ? "HeyGen request timed out." : "Failed to reach HeyGen." });
    return;
  }

  if (!upstream.ok) {
    const body = await upstream.json() as { error?: { message?: string }; message?: string };
    req.log.error({ status: upstream.status, body }, "HeyGen delete video error");
    res.status(upstream.status).json({ error: extractError(body) });
    return;
  }

  res.sendStatus(204);
});

// GET /credits — get account credit balance
router.get("/credits", async (req, res): Promise<void> => {
  let upstream: Response;
  try {
    upstream = await heygenFetch("/v2/user/remaining_quota");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    const isMissingKey = msg.includes("not set");
    req.log.error({ err }, "HeyGen credits fetch failed");
    res.status(isMissingKey ? 500 : isTimeout ? 504 : 502).json({ error: isMissingKey ? msg : isTimeout ? "HeyGen request timed out." : "Failed to reach HeyGen." });
    return;
  }

  const body = await upstream.json() as {
    data?: {
      remaining_quota?: number | null;
      quota?: number | null;
      credit_type?: string | null;
    };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen credits error");
    res.status(upstream.status).json({ error: extractError(body) });
    return;
  }

  res.json({
    remaining_credits: body?.data?.remaining_quota ?? null,
    balance: body?.data?.quota ?? null,
    credit_type: body?.data?.credit_type ?? null,
  });
});

export default router;
