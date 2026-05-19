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

function heygenHeaders() {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) throw new Error("HEYGEN_API_KEY is not set");
  return {
    "X-Api-Key": apiKey,
    "Content-Type": "application/json",
  };
}

async function heygenFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${HEYGEN_API_BASE}${path}`, {
    ...options,
    headers: {
      ...heygenHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  return res;
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
  const upstream = await heygenFetch(`/v3/avatars/looks${qs}`);
  const body = await upstream.json() as {
    data?: { looks?: unknown[]; next_token?: string | null };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen avatars error");
    res.status(upstream.status).json({ error: body?.error?.message ?? body?.message ?? "HeyGen error" });
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
  const upstream = await heygenFetch(`/v3/voices${qs}`);
  const body = await upstream.json() as {
    data?: { voices?: unknown[]; next_token?: string | null };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen voices error");
    res.status(upstream.status).json({ error: body?.error?.message ?? body?.message ?? "HeyGen error" });
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
  const upstream = await heygenFetch(`/v3/videos${qs}`);
  const body = await upstream.json() as {
    data?: { videos?: unknown[]; next_token?: string | null };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen videos error");
    res.status(upstream.status).json({ error: body?.error?.message ?? body?.message ?? "HeyGen error" });
    return;
  }

  res.json({
    videos: body?.data?.videos ?? [],
    next_token: body?.data?.next_token ?? null,
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

  const upstream = await heygenFetch("/v3/videos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const body = await upstream.json() as {
    data?: { video_id?: string; session_id?: string; status?: string };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen create video error");
    res.status(upstream.status).json({ error: body?.error?.message ?? body?.message ?? "HeyGen error" });
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

  const upstream = await heygenFetch(`/v3/videos/${params.data.videoId}`);
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
    res.status(upstream.status).json({ error: body?.error?.message ?? body?.message ?? "HeyGen error" });
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

  const upstream = await heygenFetch(`/v3/videos/${params.data.videoId}`, {
    method: "DELETE",
  });

  if (!upstream.ok) {
    const body = await upstream.json() as { error?: { message?: string }; message?: string };
    req.log.error({ status: upstream.status, body }, "HeyGen delete video error");
    res.status(upstream.status).json({ error: body?.error?.message ?? body?.message ?? "HeyGen error" });
    return;
  }

  res.sendStatus(204);
});

// POST /videos/agent — create video from prompt
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

  const upstream = await heygenFetch("/v3/video-agents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const body = await upstream.json() as {
    data?: { session_id?: string; video_id?: string; status?: string };
    error?: { message?: string };
    message?: string;
  };

  if (!upstream.ok) {
    req.log.error({ status: upstream.status, body }, "HeyGen video agent error");
    res.status(upstream.status).json({ error: body?.error?.message ?? body?.message ?? "HeyGen error" });
    return;
  }

  res.status(201).json({
    video_id: body?.data?.video_id ?? body?.data?.session_id ?? "",
    session_id: body?.data?.session_id ?? null,
    status: body?.data?.status ?? "pending",
  });
});

// GET /credits — get account credit balance
router.get("/credits", async (req, res): Promise<void> => {
  const upstream = await heygenFetch("/v1/user/remaining_quota");
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
    res.status(upstream.status).json({ error: body?.error?.message ?? body?.message ?? "HeyGen error" });
    return;
  }

  res.json({
    remaining_credits: body?.data?.remaining_quota ?? null,
    balance: body?.data?.quota ?? null,
    credit_type: body?.data?.credit_type ?? null,
  });
});

export default router;
