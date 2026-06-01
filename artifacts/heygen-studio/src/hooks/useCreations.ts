import { useState, useEffect, useCallback } from "react";

export interface Creation {
  id: string;
  type: "image" | "video";
  model_id: string;
  model_name: string;
  prompt: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  request_id?: string;
  output_urls: string[];   // image URLs or [videoUrl]
  created_at: number;
  error?: string;
}

const STORAGE_KEY = "heygen_studio_creations";

function load(): Creation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Creation[];
  } catch {
    return [];
  }
}

function save(items: Creation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useCreations() {
  const [creations, setCreations] = useState<Creation[]>(load);

  const persist = useCallback((items: Creation[]) => {
    save(items);
    setCreations(items);
  }, []);

  const add = useCallback((c: Creation) => {
    setCreations(prev => {
      const next = [c, ...prev];
      save(next);
      return next;
    });
  }, []);

  const update = useCallback((id: string, patch: Partial<Creation>) => {
    setCreations(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...patch } : c);
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setCreations(prev => {
      const next = prev.filter(c => c.id !== id);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => persist([]), [persist]);

  return { creations, add, update, remove, clear };
}
