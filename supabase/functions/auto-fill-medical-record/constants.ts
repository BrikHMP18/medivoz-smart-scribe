export const DEFAULT_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
export const WORKFLOW_TIMEOUT = 60_000;

// ALLOWED_ORIGINS env var: comma-separated list of allowed origins.
// If not set, all origins are allowed (for local development).
const ALLOWED_ORIGINS = Deno.env.get("ALLOWED_ORIGINS")?.split(",") || [];

export const getCorsHeaders = (origin: string | null) => {
  const isAllowed =
    ALLOWED_ORIGINS.length === 0 ||
    (origin != null && ALLOWED_ORIGINS.includes(origin));

  return {
    "Access-Control-Allow-Origin": isAllowed ? (origin || "") : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
};