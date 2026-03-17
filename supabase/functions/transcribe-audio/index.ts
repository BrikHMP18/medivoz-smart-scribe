import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { processBase64Chunks } from "./base64-utils.ts";
import { getCorsHeaders, createJsonResponse } from "./cors-utils.ts";
import { transcribeAudio } from "./openai-service.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createJsonResponse({ error: "Missing authorization header" }, origin, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createJsonResponse({ error: "Unauthorized" }, origin, 401);
    }

    const requestData = await req.json().catch(err => {
      console.error("Error parsing request JSON:", err);
      throw new Error("Invalid JSON in request body");
    });

    const { audio } = requestData;

    if (!audio) {
      throw new Error("No audio data provided");
    }

    if (audio.length === 0) {
      throw new Error("Audio data is empty");
    }

    console.log("Processing audio for user:", user.id, "size:", audio.length);

    const binaryAudio = processBase64Chunks(audio);
    if (binaryAudio.length === 0) {
      throw new Error("Failed to process audio data");
    }

    const result = await transcribeAudio(binaryAudio);

    return createJsonResponse({
      rawTranscription: result,
      formattedTranscription: result.text || ""
    }, origin);

  } catch (error) {
    console.error("Error in transcribe-audio function:", error.message);
    return createJsonResponse({ error: "An internal error occurred" }, origin, 500);
  }
});
