
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error("No audio data provided");
    }

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    
    // Prepare form data
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: "audio/webm" });
    formData.append("file", blob, "audio.webm");
    formData.append("model", "gpt-4o-transcribe");
    formData.append("response_format", "verbose_json");
    formData.append("timestamp_granularities", "segment");
    
    // Get OpenAI API key from environment
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    console.log("Sending audio to OpenAI for transcription...");
    
    // Send to OpenAI
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await response.json();
    console.log("Transcription successful");

    // Format the transcript with speaker detection and timestamps
    let formattedTranscript = "";
    if (result.segments) {
      // Process segments to identify speakers and add timestamps
      formattedTranscript = formatTranscriptionWithSpeakers(result.segments);
    } else {
      // Fallback if segments are not available
      formattedTranscript = result.text;
    }

    return new Response(
      JSON.stringify({ 
        rawTranscription: result,
        formattedTranscription: formattedTranscript 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in transcribe-audio function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Function to format transcription with speaker detection and timestamps
function formatTranscriptionWithSpeakers(segments: any[]) {
  // Simple speaker detection based on patterns
  // In a real implementation, you might use a more sophisticated algorithm
  let formattedText = "";
  let currentSpeaker = "";
  
  segments.forEach((segment, index) => {
    // Try to detect speaker based on content patterns
    let detectedSpeaker = determineSpeekerFromText(segment.text);
    
    // Format timestamp from start value (in seconds)
    const timestamp = formatTimestamp(segment.start);
    
    // If this is a new speaker or the first segment, add the speaker label
    if (detectedSpeaker !== currentSpeaker || index === 0) {
      formattedText += `\n${detectedSpeaker} (${timestamp}): ${segment.text}\n`;
      currentSpeaker = detectedSpeaker;
    } else {
      // Continue with the same speaker
      formattedText += `${segment.text} `;
    }
  });
  
  return formattedText.trim();
}

// Helper function to determine speaker from text patterns
function determineSpeekerFromText(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Simple heuristic - in a medical context:
  // - Questions often come from the doctor
  // - Descriptions of symptoms often come from the patient
  if (
    lowerText.includes("?") || 
    lowerText.includes("tell me") || 
    lowerText.includes("describe") ||
    lowerText.includes("how are you") ||
    lowerText.includes("what brings you") ||
    lowerText.startsWith("have you") ||
    lowerText.startsWith("are you")
  ) {
    return "🩺 Doctor";
  } else if (
    lowerText.includes("pain") || 
    lowerText.includes("feel") || 
    lowerText.includes("hurt") ||
    lowerText.includes("symptom") ||
    lowerText.includes("i've been") ||
    lowerText.includes("i have") ||
    lowerText.includes("i am")
  ) {
    return "👤 Paciente";
  }
  
  // Default if we can't determine
  return "👥 Hablante";
}

// Format seconds into MM:SS format
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
