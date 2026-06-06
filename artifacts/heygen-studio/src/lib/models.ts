export type ModelCategory = "image" | "video";

export interface ModelParam {
  key: string;
  label: string;
  type: "text" | "select" | "number" | "boolean";
  default?: string | number | boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface Model {
  id: string;          // fal.ai model ID
  name: string;
  description: string;
  provider: string;
  providerColor: string;
  category: ModelCategory;
  badge?: string;      // e.g. "NEW", "FAST", "PRO"
  params: ModelParam[];
}

const ASPECT_RATIO_OPTIONS = [
  { label: "Landscape (16:9)", value: "16:9" },
  { label: "Portrait (9:16)", value: "9:16" },
  { label: "Square (1:1)", value: "1:1" },
];

const DURATION_OPTIONS = [
  { label: "5 seconds", value: "5" },
  { label: "10 seconds", value: "10" },
];

const IMAGE_SIZE_OPTIONS = [
  { label: "Landscape 4:3", value: "landscape_4_3" },
  { label: "Portrait 4:3", value: "portrait_4_3" },
  { label: "Square HD", value: "square_hd" },
  { label: "Square", value: "square" },
  { label: "Landscape 16:9", value: "landscape_16_9" },
  { label: "Portrait 16:9", value: "portrait_16_9" },
];

const KLING_PARAMS: ModelParam[] = [
  { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video you want to generate..." },
  { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
  { key: "duration", label: "Duration", type: "select", default: "5", options: DURATION_OPTIONS },
  { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
];

export const ALL_MODELS: Model[] = [
  // ─── VIDEO MODELS ───────────────────────────────────────────────────────────
  {
    id: "kling-direct/v2-master-omni",
    name: "Kling Omni",
    description: "Kling's Omni tier — highest quality direct API with cinematic Pro mode and photorealistic output.",
    provider: "Kuaishou",
    providerColor: "#FF6B35",
    category: "video",
    badge: "OMNI",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video you want to generate..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "duration", label: "Duration", type: "select", default: "5", options: DURATION_OPTIONS },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
      { key: "mode", label: "Mode", type: "select", default: "pro", options: [
        { label: "Pro (best quality)", value: "pro" },
        { label: "Standard", value: "std" },
      ]},
    ],
  },
  {
    id: "fal-ai/kling-video/v2.1/master/text-to-video",
    name: "Kling 2.1 Master",
    description: "Highest quality Kling video generation with cinematic motion and photorealism.",
    provider: "Kuaishou",
    providerColor: "#FF6B35",
    category: "video",
    badge: "TOP",
    params: KLING_PARAMS,
  },
  {
    id: "fal-ai/kling-video/v2.1/standard/text-to-video",
    name: "Kling 2.1 Standard",
    description: "Balanced quality and speed. Kling 2.1 with excellent motion consistency.",
    provider: "Kuaishou",
    providerColor: "#FF6B35",
    category: "video",
    badge: "NEW",
    params: KLING_PARAMS,
  },
  {
    id: "fal-ai/kling-video/v1.6/pro/text-to-video",
    name: "Kling 1.6 Pro",
    description: "Professional-grade Kling video generation with high fidelity.",
    provider: "Kuaishou",
    providerColor: "#FF6B35",
    category: "video",
    params: KLING_PARAMS,
  },
  {
    id: "fal-ai/kling-video/v1.6/standard/text-to-video",
    name: "Kling 1.6 Standard",
    description: "Standard Kling generation, great for quick drafts.",
    provider: "Kuaishou",
    providerColor: "#FF6B35",
    category: "video",
    params: KLING_PARAMS,
  },
  {
    id: "fal-ai/kling-video/v1.6/nano/text-to-video",
    name: "Kling Nano",
    description: "Fastest Kling variant. Optimized for speed with great quality.",
    provider: "Kuaishou",
    providerColor: "#FF6B35",
    category: "video",
    badge: "FAST",
    params: KLING_PARAMS,
  },
  {
    id: "fal-ai/seedance-1-0-pro/text-to-video",
    name: "Seedance 1.0 Pro",
    description: "ByteDance's Seedance Pro — highest fidelity video with superior motion coherence and detail.",
    provider: "ByteDance",
    providerColor: "#1D9BF0",
    category: "video",
    badge: "PRO",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "duration", label: "Duration", type: "select", default: "5", options: DURATION_OPTIONS },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
      { key: "resolution", label: "Resolution", type: "select", default: "1080p", options: [
        { label: "1080p", value: "1080p" },
        { label: "720p", value: "720p" },
      ]},
    ],
  },
  {
    id: "fal-ai/seedance-1-0/text-to-video",
    name: "Seedance 1.0",
    description: "ByteDance's Seedance — fluid motion, rich detail, and expressive video synthesis.",
    provider: "ByteDance",
    providerColor: "#1D9BF0",
    category: "video",
    badge: "NEW",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "duration", label: "Duration", type: "select", default: "5", options: DURATION_OPTIONS },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
    ],
  },
  {
    id: "fal-ai/seedance-1-0-lite/text-to-video",
    name: "Seedance Lite",
    description: "ByteDance's Seedance Lite — fast video generation for rapid iteration.",
    provider: "ByteDance",
    providerColor: "#1D9BF0",
    category: "video",
    badge: "FAST",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video..." },
      { key: "duration", label: "Duration", type: "select", default: "5", options: DURATION_OPTIONS },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
    ],
  },
  {
    id: "fal-ai/wan/v2.1/1.3b/text-to-video",
    name: "Wan 2.1 (1.3B)",
    description: "Lightweight Wan model for fast, high-quality open-domain video generation.",
    provider: "Alibaba",
    providerColor: "#FF6A00",
    category: "video",
    badge: "FAST",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
    ],
  },
  {
    id: "fal-ai/wan/v2.1/14b/text-to-video",
    name: "Wan 2.1 (14B)",
    description: "Full-scale Wan model with superior motion quality and temporal coherence.",
    provider: "Alibaba",
    providerColor: "#FF6A00",
    category: "video",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
    ],
  },
  {
    id: "fal-ai/hunyuan-video",
    name: "Hunyuan Video",
    description: "Tencent's Hunyuan — high-fidelity video with strong prompt adherence.",
    provider: "Tencent",
    providerColor: "#12B76A",
    category: "video",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
    ],
  },
  {
    id: "fal-ai/minimax/video-01-live",
    name: "MiniMax Video-01 Live",
    description: "MiniMax's flagship video model with realistic motion and diverse scenes.",
    provider: "MiniMax",
    providerColor: "#7C3AED",
    category: "video",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video..." },
      { key: "prompt_optimizer", label: "Optimize Prompt", type: "boolean", default: true },
    ],
  },
  {
    id: "fal-ai/pixverse/v4.5/text-to-video",
    name: "Pixverse v4.5",
    description: "High-quality text-to-video with cinematic effects and smooth motion.",
    provider: "Pixverse",
    providerColor: "#EC4899",
    category: "video",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "duration", label: "Duration", type: "select", default: "5", options: DURATION_OPTIONS },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
    ],
  },
  {
    id: "fal-ai/cogvideox-5b",
    name: "CogVideoX 5B",
    description: "THUDM's open-source video generation model with strong coherence.",
    provider: "THUDM",
    providerColor: "#6366F1",
    category: "video",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "num_inference_steps", label: "Steps", type: "number", default: 50, min: 10, max: 100 },
    ],
  },
  {
    id: "fal-ai/luma-dream-machine/ray-2-flash",
    name: "Luma Ray 2 Flash",
    description: "Luma AI's fast text-to-video model with excellent prompt following.",
    provider: "Luma AI",
    providerColor: "#00D4AA",
    category: "video",
    badge: "FAST",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video..." },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
    ],
  },
  {
    id: "fal-ai/ltx-video",
    name: "LTX-Video",
    description: "Lightricks' LTX-Video — ultra-fast open-source video generation. Real-time capable, exceptional quality per second.",
    provider: "Lightricks",
    providerColor: "#E11D48",
    category: "video",
    badge: "FAST",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video scene in detail..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
      { key: "num_frames", label: "Frames", type: "number", default: 121, min: 25, max: 257 },
      { key: "frame_rate", label: "Frame Rate", type: "number", default: 25, min: 12, max: 30 },
      { key: "guidance_scale", label: "Guidance Scale", type: "number", default: 3, min: 1, max: 10 },
      { key: "num_inference_steps", label: "Steps", type: "number", default: 40, min: 10, max: 60 },
    ],
  },
  {
    id: "fal-ai/ltx-video-v095/turbo",
    name: "LTX-Video Turbo",
    description: "LTX-Video 0.9.5 Turbo — fastest LTX variant, near real-time generation with distillation.",
    provider: "Lightricks",
    providerColor: "#E11D48",
    category: "video",
    badge: "FAST",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the video scene..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: ASPECT_RATIO_OPTIONS },
      { key: "num_frames", label: "Frames", type: "number", default: 121, min: 25, max: 257 },
      { key: "num_inference_steps", label: "Steps", type: "number", default: 8, min: 4, max: 16 },
    ],
  },

  // ─── IMAGE MODELS ────────────────────────────────────────────────────────────
  {
    id: "fal-ai/seedream-3",
    name: "Seedream 3.0",
    description: "ByteDance's Seedream — state-of-the-art image generation with rich detail and realism.",
    provider: "ByteDance",
    providerColor: "#1D9BF0",
    category: "image",
    badge: "TOP",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the image..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "image_size", label: "Size", type: "select", default: "landscape_4_3", options: IMAGE_SIZE_OPTIONS },
      { key: "num_images", label: "Number of Images", type: "number", default: 1, min: 1, max: 4 },
      { key: "guidance_scale", label: "Guidance Scale", type: "number", default: 3.5, min: 1, max: 10 },
    ],
  },
  {
    id: "fal-ai/flux-pro/v1.1",
    name: "FLUX 1.1 Pro",
    description: "Black Forest Labs' flagship FLUX model — best prompt adherence and quality.",
    provider: "Black Forest Labs",
    providerColor: "#1A1A2E",
    category: "image",
    badge: "TOP",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the image..." },
      { key: "image_size", label: "Size", type: "select", default: "landscape_4_3", options: IMAGE_SIZE_OPTIONS },
      { key: "num_images", label: "Number of Images", type: "number", default: 1, min: 1, max: 4 },
      { key: "safety_tolerance", label: "Safety Tolerance", type: "select", default: "2", options: [
        { label: "Strict (1)", value: "1" },
        { label: "Balanced (2)", value: "2" },
        { label: "Relaxed (6)", value: "6" },
      ]},
    ],
  },
  {
    id: "fal-ai/flux/schnell",
    name: "FLUX Schnell",
    description: "Fastest FLUX variant. 4-step generation for instant results.",
    provider: "Black Forest Labs",
    providerColor: "#1A1A2E",
    category: "image",
    badge: "FAST",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the image..." },
      { key: "image_size", label: "Size", type: "select", default: "landscape_4_3", options: IMAGE_SIZE_OPTIONS },
      { key: "num_images", label: "Number of Images", type: "number", default: 1, min: 1, max: 4 },
      { key: "num_inference_steps", label: "Steps", type: "number", default: 4, min: 1, max: 12 },
    ],
  },
  {
    id: "fal-ai/flux/dev",
    name: "FLUX Dev",
    description: "Guidance-distilled FLUX for high-quality generation with 28-50 steps.",
    provider: "Black Forest Labs",
    providerColor: "#1A1A2E",
    category: "image",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the image..." },
      { key: "image_size", label: "Size", type: "select", default: "landscape_4_3", options: IMAGE_SIZE_OPTIONS },
      { key: "num_images", label: "Number of Images", type: "number", default: 1, min: 1, max: 4 },
      { key: "num_inference_steps", label: "Steps", type: "number", default: 28, min: 10, max: 50 },
      { key: "guidance_scale", label: "Guidance Scale", type: "number", default: 3.5, min: 1, max: 10 },
    ],
  },
  {
    id: "fal-ai/stable-diffusion-v35-large",
    name: "Stable Diffusion 3.5 Large",
    description: "Stability AI's SD 3.5 Large — versatile and highly detailed image synthesis.",
    provider: "Stability AI",
    providerColor: "#7C3AED",
    category: "image",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the image..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "image_size", label: "Size", type: "select", default: "landscape_4_3", options: IMAGE_SIZE_OPTIONS },
      { key: "num_images", label: "Number of Images", type: "number", default: 1, min: 1, max: 4 },
      { key: "num_inference_steps", label: "Steps", type: "number", default: 28, min: 10, max: 50 },
      { key: "guidance_scale", label: "Guidance Scale", type: "number", default: 7, min: 1, max: 20 },
    ],
  },
  {
    id: "fal-ai/ideogram/v3",
    name: "Ideogram v3",
    description: "Ideogram's best model — exceptional text rendering and design-quality visuals.",
    provider: "Ideogram",
    providerColor: "#F59E0B",
    category: "image",
    badge: "NEW",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the image (great for text and logos)..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "ASPECT_16_9", options: [
        { label: "Landscape (16:9)", value: "ASPECT_16_9" },
        { label: "Portrait (9:16)", value: "ASPECT_9_16" },
        { label: "Square (1:1)", value: "ASPECT_1_1" },
        { label: "Photo (4:3)", value: "ASPECT_4_3" },
        { label: "Photo (3:4)", value: "ASPECT_3_4" },
      ]},
      { key: "magic_prompt_option", label: "Magic Prompt", type: "select", default: "Auto", options: [
        { label: "Auto", value: "Auto" },
        { label: "On", value: "On" },
        { label: "Off", value: "Off" },
      ]},
    ],
  },
  {
    id: "fal-ai/recraft-v3",
    name: "Recraft v3",
    description: "World-class vector-style and illustration generation. Tops ImageArena leaderboard.",
    provider: "Recraft",
    providerColor: "#0EA5E9",
    category: "image",
    badge: "TOP",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the image..." },
      { key: "image_size", label: "Size", type: "select", default: "landscape_4_3", options: IMAGE_SIZE_OPTIONS },
      { key: "style", label: "Style", type: "select", default: "realistic_image", options: [
        { label: "Realistic", value: "realistic_image" },
        { label: "Digital Illustration", value: "digital_illustration" },
        { label: "Vector Illustration", value: "vector_illustration" },
        { label: "Icon", value: "icon" },
      ]},
    ],
  },
  {
    id: "fal-ai/imagen4/preview",
    name: "Imagen 4",
    description: "Google DeepMind's Imagen 4 — photorealistic, rich detail, strong text understanding.",
    provider: "Google",
    providerColor: "#4285F4",
    category: "image",
    badge: "NEW",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the image..." },
      { key: "aspect_ratio", label: "Aspect Ratio", type: "select", default: "16:9", options: [
        { label: "Landscape (16:9)", value: "16:9" },
        { label: "Portrait (9:16)", value: "9:16" },
        { label: "Square (1:1)", value: "1:1" },
        { label: "Photo (4:3)", value: "4:3" },
        { label: "Photo (3:4)", value: "3:4" },
      ]},
      { key: "num_images", label: "Number of Images", type: "number", default: 1, min: 1, max: 4 },
    ],
  },
  {
    id: "fal-ai/kolors",
    name: "Kolors",
    description: "Kuaishou's Kolors — vibrant color expression and strong Chinese-language prompt support.",
    provider: "Kuaishou",
    providerColor: "#FF6B35",
    category: "image",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the image..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "image_size", label: "Size", type: "select", default: "landscape_4_3", options: IMAGE_SIZE_OPTIONS },
      { key: "num_images", label: "Number of Images", type: "number", default: 1, min: 1, max: 4 },
      { key: "num_inference_steps", label: "Steps", type: "number", default: 50, min: 10, max: 100 },
      { key: "guidance_scale", label: "Guidance Scale", type: "number", default: 5, min: 1, max: 20 },
    ],
  },
  {
    id: "fal-ai/aura-flow",
    name: "AuraFlow",
    description: "Fast flow-matching image generation with excellent aesthetic quality.",
    provider: "AuraDev",
    providerColor: "#8B5CF6",
    category: "image",
    badge: "FAST",
    params: [
      { key: "prompt", label: "Prompt", type: "text", placeholder: "Describe the image..." },
      { key: "negative_prompt", label: "Negative Prompt", type: "text", placeholder: "What to avoid..." },
      { key: "num_images", label: "Number of Images", type: "number", default: 1, min: 1, max: 4 },
      { key: "num_inference_steps", label: "Steps", type: "number", default: 25, min: 10, max: 50 },
      { key: "guidance_scale", label: "Guidance Scale", type: "number", default: 3.5, min: 1, max: 10 },
    ],
  },
];

export const IMAGE_MODELS = ALL_MODELS.filter(m => m.category === "image");
export const VIDEO_MODELS = ALL_MODELS.filter(m => m.category === "video");

export function getModel(id: string): Model | undefined {
  return ALL_MODELS.find(m => m.id === id);
}
