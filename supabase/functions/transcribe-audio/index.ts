
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
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
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

// Advanced speaker detection and formatting for medical consultation
function formatTranscriptionWithSpeakers(segments: any[]) {
  let formattedText = "";
  let currentSpeaker = "";
  let currentTimestamp = "";
  let buffer = "";
  
  // First pass to detect speaker changes with context
  segments.forEach((segment, index) => {
    // Format timestamp from start value (in seconds)
    const timestamp = formatTimestamp(segment.start);
    
    // Try to detect speaker based on content and context
    let detectedSpeaker = determineSpeakerFromText(segment.text, index > 0 ? segments[index-1].text : "");
    
    // If this is a new speaker, new timestamp, or the first segment
    if (detectedSpeaker !== currentSpeaker || timestamp !== currentTimestamp || index === 0) {
      // If we have a buffer, add it to formatted text before starting new speaker
      if (buffer.length > 0) {
        formattedText += buffer + "\n\n";
        buffer = "";
      }
      
      // Start a new speaker section
      buffer = `${detectedSpeaker} (${timestamp}): ${segment.text}`;
      currentSpeaker = detectedSpeaker;
      currentTimestamp = timestamp;
    } else {
      // Continue with the same speaker
      buffer += " " + segment.text;
    }
  });
  
  // Add any remaining buffer
  if (buffer.length > 0) {
    formattedText += buffer;
  }
  
  return formattedText.trim();
}

// Advanced speaker detection for medical consultation
function determineSpeakerFromText(text: string, previousText: string = ""): string {
  const lowerText = text.toLowerCase();
  const lowerPrevText = previousText.toLowerCase();
  
  // Stronger patterns for doctor
  if (
    // Questions are often from the doctor
    lowerText.includes("?") || 
    // Medical instructions/advice
    lowerText.includes("recomiendo") ||
    lowerText.includes("debe tomar") ||
    lowerText.includes("le voy a recetar") ||
    lowerText.includes("tiene que") ||
    lowerText.includes("diagnóstico") ||
    // Introductory phrases
    lowerText.startsWith("dígame") ||
    lowerText.startsWith("cuénteme") ||
    lowerText.startsWith("explíqueme") ||
    // Professional terminology
    lowerText.includes("evaluación") ||
    lowerText.includes("tratamiento") ||
    // Previous text was clearly patient and this is a response
    (lowerPrevText.includes("me duele") && !lowerText.includes("me duele"))
  ) {
    return "🩺 Doctor";
  } 
  // Stronger patterns for patient
  else if (
    // Descriptions of personal symptoms
    lowerText.includes("me duele") || 
    lowerText.includes("tengo dolor") ||
    lowerText.includes("siento") ||
    lowerText.includes("he notado") ||
    lowerText.includes("me preocupa") ||
    // Personal health history
    lowerText.includes("mi historia") ||
    lowerText.includes("mi familia") ||
    lowerText.includes("he estado") ||
    // Previous text was clearly doctor asking a question
    (lowerPrevText.includes("?") && !lowerText.includes("?"))
  ) {
    return "👤 Paciente";
  }
  
  // Contextual detection based on content length and other factors
  // More detailed responses are likely from the patient explaining symptoms
  if (text.length > 100 && !lowerText.includes("?")) {
    return "👤 Paciente";
  }
  
  // Short, directed questions are typically from the doctor
  if (text.length < 50 && lowerText.includes("?")) {
    return "🩺 Doctor";
  }
  
  // If we can't determine with confidence, use generic speaker
  return "👥 Hablante";
}

// Format seconds into MM:SS format
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
