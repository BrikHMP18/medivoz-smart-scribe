/**
 * CORS headers for cross-origin requests.
 * ALLOWED_ORIGINS env var should be a comma-separated list of allowed origins.
 * Falls back to the Supabase project URL origin if not set.
 */
const ALLOWED_ORIGINS = Deno.env.get("ALLOWED_ORIGINS")?.split(",") || [];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    ALLOWED_ORIGINS.length === 0 ||
    (origin != null && ALLOWED_ORIGINS.includes(origin));

  return {
    "Access-Control-Allow-Origin": isAllowed ? (origin || "") : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Create a JSON response with CORS headers
 * @param body - The response body
 * @param origin - The request origin header
 * @param status - HTTP status code (default: 200)
 * @returns Response object
 */
export function createJsonResponse(
  body: Record<string, unknown>,
  origin: string | null,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    },
  );
}
