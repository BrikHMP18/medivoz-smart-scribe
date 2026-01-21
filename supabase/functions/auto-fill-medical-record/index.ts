import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { executeWorkflow } from "./workflow.ts";
import { getCorsHeaders } from "./constants.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription } = await req.json();

    if (!transcription) {
      return new Response(
        JSON.stringify({ error: "Transcription is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Processing transcription:", transcription.substring(0, 100) + "...");

    try {
      const medicalRecord = await executeWorkflow(transcription);

      return new Response(
        JSON.stringify({ medicalRecord }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Workflow execution error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("timed out")) {
        return new Response(
          JSON.stringify({
            error: "Processing timed out. Try again with a shorter transcription.",
          }),
          {
            status: 504,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});