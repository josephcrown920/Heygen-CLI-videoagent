import { Router, type IRouter } from "express";
import crypto from "crypto";

const router: IRouter = Router();

const KLING_API_BASE = "https://api.klingai.com";
const REQUEST_TIMEOUT_MS = 30_000;

function buildKlingJWT(): string {
  const accessKey = process.env.KLING_ACCESS_KEY;
  const apiSecret = process.env.KLING_API_SECRET;
  if (!accessKey || !apiSecret) {
    throw new Error("KLING_ACCESS_KEY or KLING_API_SECRET is not set");
  }
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5 })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", apiSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${sig}`;
}

function klingHeaders() {
  return {
    Authorization: `Bearer ${buildKlingJWT()}`,
    "Content-Type": "application/json",
  };
}

async function klingFetch(path: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${KLING_API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...klingHeaders(),
        ...(options.headers as Record<string, string> | undefined),
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// POST /api/kling/text-to-video
router.post("/kling/text-to-video", async (req, res) => {
  try {
    const {
      prompt,
      negative_prompt,
      model_name = "kling-v2-master",
      aspect_ratio = "16:9",
      duration = "5",
      mode = "std",
      cfg_scale = 0.5,
    } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const resp = await klingFetch("/v1/videos/text2video", {
      method: "POST",
      body: JSON.stringify({
        prompt,
        negative_prompt,
        model_name,
        aspect_ratio,
        duration,
        mode,
        cfg_scale,
      }),
    });

    const data = await resp.json() as Record<string, unknown>;
    if (!resp.ok) {
      res.status(resp.status).json(data);
      return;
    }
    res.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// POST /api/kling/image-to-video
router.post("/kling/image-to-video", async (req, res) => {
  try {
    const {
      prompt,
      image_url,
      negative_prompt,
      model_name = "kling-v2-master",
      aspect_ratio = "16:9",
      duration = "5",
      mode = "std",
      cfg_scale = 0.5,
    } = req.body;

    if (!prompt || !image_url) {
      res.status(400).json({ error: "prompt and image_url are required" });
      return;
    }

    const resp = await klingFetch("/v1/videos/image2video", {
      method: "POST",
      body: JSON.stringify({
        prompt,
        negative_prompt,
        image_url,
        model_name,
        aspect_ratio,
        duration,
        mode,
        cfg_scale,
      }),
    });

    const data = await resp.json() as Record<string, unknown>;
    if (!resp.ok) {
      res.status(resp.status).json(data);
      return;
    }
    res.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// GET /api/kling/task/:taskId — poll task status
router.get("/kling/task/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const resp = await klingFetch(`/v1/videos/text2video/${taskId}`);
    const data = await resp.json() as Record<string, unknown>;
    if (!resp.ok) {
      res.status(resp.status).json(data);
      return;
    }
    res.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// GET /api/kling/models — list available Kling models
router.get("/kling/models", (_req, res) => {
  res.json({
    models: [
      { id: "kling-v2-master", name: "Kling Omni (v2 Master Pro)", description: "Highest quality cinematic generation — Omni Pro mode", modes: ["pro", "std"] },
      { id: "kling-v2-master", name: "Kling v2 Master", description: "Top-tier Kling v2 generation", modes: ["std"] },
      { id: "kling-v1-6-pro", name: "Kling v1.6 Pro", description: "Pro tier, balanced quality/speed" },
      { id: "kling-v1-6-standard", name: "Kling v1.6 Standard", description: "Standard tier" },
      { id: "kling-v1-5-pro", name: "Kling v1.5 Pro", description: "Previous gen Pro" },
    ],
  });
});

export default router;
