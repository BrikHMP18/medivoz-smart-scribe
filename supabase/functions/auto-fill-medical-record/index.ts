
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { executeWorkflow } from "./workflow.ts";
import { corsHeaders } from "./constants.ts";

// Handle incoming requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription } = await req.json();
    
    if (!transcription) {
      return new Response(
        JSON.stringify({ error: "Transcription is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing transcription:", transcription.substring(0, 100) + "...");
    
    try {
      const medicalRecord = await executeWorkflow(transcription);
      
      // Return the generated medical record
      return new Response(
        JSON.stringify({ medicalRecord }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Workflow execution error:", error);
      if (error.message.includes("timed out")) {
        return new Response(
          JSON.stringify({ error: "Processing timed out. Try again with a shorter transcription." }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
