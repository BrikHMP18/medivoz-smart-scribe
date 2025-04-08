
/**
 * CORS headers for cross-origin requests
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Create a JSON response with CORS headers
 * @param body - The response body
 * @param status - HTTP status code (default: 200)
 * @returns Response object
 */
export function createJsonResponse(body: any, status = 200): Response {
  return new Response(
    JSON.stringify(body),
    { 
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}
