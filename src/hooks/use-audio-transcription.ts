import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { blobToBase64 } from "@/utils/audio";

interface UseAudioTranscriptionProps {
  onTranscriptionComplete?: (transcription: string) => void;
}

interface UseAudioTranscriptionResult {
  isTranscribing: boolean;
  transcribeAudio: (audioBlob: Blob) => Promise<string>;
}

export function useAudioTranscription({
  onTranscriptionComplete
}: UseAudioTranscriptionProps = {}): UseAudioTranscriptionResult {
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Transcribe the recorded audio
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    // Add debugging information
    console.log("Attempting to transcribe audio");
    console.log("Audio blob exists:", !!audioBlob);
    
    if (!audioBlob) {
      console.error("No audio blob available for transcription");
      toast.error("No hay audio para transcribir");
      return "";
    }
    
    if (audioBlob.size === 0) {
      console.error("Audio blob is empty (size: 0)");
      toast.error("La grabación de audio está vacía");
      return "";
    }
    
    setIsTranscribing(true);
    
    try {
      // Convert Blob to base64
      console.log("Starting base64 conversion for blob size:", audioBlob.size);
      const base64Audio = await blobToBase64(audioBlob);
      
      if (!base64Audio) {
        throw new Error("Failed to convert audio to base64");
      }
      
      console.log("Audio converted to base64, length:", base64Audio.length);
      
      // Call our edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });
      
      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      // Handle the transcription result
      console.log("Transcription data received:", data ? "yes" : "no");
      
      // Extract the transcription from the response
      const transcription = data?.formattedTranscription || data?.rawTranscription?.text || "";
      console.log("Final transcription length:", transcription.length);
      
      if (onTranscriptionComplete && transcription) {
        onTranscriptionComplete(transcription);
      }
      
      return transcription;
      
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Error al transcribir el audio');
      return "";
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    isTranscribing,
    transcribeAudio
  };
}
