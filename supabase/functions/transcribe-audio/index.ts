
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { processBase64Chunks } from "./base64-utils.ts";
import { corsHeaders, createJsonResponse } from "./cors-utils.ts";
import { transcribeAudio } from "./openai-service.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData = await req.json().catch(err => {
      console.error("Error parsing request JSON:", err);
      throw new Error("Invalid JSON in request body");
    });
    
    const { audio } = requestData;
    
    if (!audio) {
      console.error("No audio data provided in request");
      throw new Error("No audio data provided");
    }

    console.log("Received audio data, processing...");
    console.log("Audio data length:", audio.length);
    
    if (audio.length === 0) {
      throw new Error("Audio data is empty");
    }
    
    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    if (binaryAudio.length === 0) {
      throw new Error("Failed to process audio data");
    }
    
    console.log("Audio processed, size:", binaryAudio.length, "bytes");
    
    // Send to OpenAI for transcription
    const result = await transcribeAudio(binaryAudio);

    // Return the transcription
    return createJsonResponse({ 
      rawTranscription: result,
      formattedTranscription: result.text || "" 
    });

  } catch (error) {
    console.error("Error in transcribe-audio function:", error);
    return createJsonResponse(
      { error: error.message },
      500
    );
  }
});
