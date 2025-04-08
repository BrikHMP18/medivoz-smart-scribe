
/**
 * Service for handling OpenAI transcription API requests
 */

/**
 * Transcribe audio using OpenAI's Whisper API
 * @param audioData - Binary audio data
 * @returns The transcription result
 */
export async function transcribeAudio(audioData: Uint8Array): Promise<any> {
  // Get OpenAI API key from environment
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    console.error("OpenAI API key not found");
    throw new Error("OpenAI API key not found");
  }

  // Prepare form data
  const formData = new FormData();
  const blob = new Blob([audioData], { type: "audio/webm" });
  formData.append("file", blob, "audio.webm");
  formData.append("model", "whisper-1");
  
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
  
  return result;
}
