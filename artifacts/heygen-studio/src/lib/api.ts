const BASE_URL = import.meta.env.BASE_URL?.replace(/\/+$/, "") ?? "";

export function apiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
}

export function apiLoginPath(returnTo?: string): string {
  const params = new URLSearchParams();
  if (returnTo) params.set("returnTo", returnTo);
  const qs = params.toString();
  return `${apiPath("/api/login")}${qs ? `?${qs}` : ""}`;
}

export function getAppBasePath(): string {
  return BASE_URL || "/";
}
