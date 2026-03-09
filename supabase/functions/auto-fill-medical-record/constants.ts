export const DEFAULT_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
export const WORKFLOW_TIMEOUT = 60_000;

// Get allowed origins from environment or use default
// SECURITY: In production, this should be restricted to your domain
const ALLOWED_ORIGINS = Deno.env.get("ALLOWED_ORIGINS")?.split(",") || ["*"];

export const getCorsHeaders = (origin: string | null) => {
  const allowOrigin = 
    ALLOWED_ORIGINS.includes("*") || 
    (origin && ALLOWED_ORIGINS.includes(origin))
      ? origin || "*"
      : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400", // 24 hours
  };
};

// Legacy export for backward compatibility (will use wildcard)
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};