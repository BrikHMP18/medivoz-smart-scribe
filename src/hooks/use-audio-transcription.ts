import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { blobToBase64 } from "@/utils/audio";
import { logger } from "@/utils/logger";

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
    logger.log("Attempting to transcribe audio");
    logger.log("Audio blob exists:", !!audioBlob);
    
    if (!audioBlob) {
      logger.error("No audio blob available for transcription");
      toast.error("No hay audio para transcribir");
      return "";
    }
    
    if (audioBlob.size === 0) {
      logger.error("Audio blob is empty (size: 0)");
      toast.error("La grabación de audio está vacía");
      return "";
    }
    
    setIsTranscribing(true);
    
    try {
      // Convert Blob to base64
      logger.log("Starting base64 conversion for blob size:", audioBlob.size);
      const base64Audio = await blobToBase64(audioBlob);
      
      if (!base64Audio) {
        throw new Error("Failed to convert audio to base64");
      }
      
      logger.log("Audio converted to base64, length:", base64Audio.length);
      
      // Call our edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });
      
      if (error) {
        logger.error("Supabase function error:", error);
        throw error;
      }
      
      // Handle the transcription result
      logger.log("Transcription data received:", data ? "yes" : "no");
      
      // Extract the transcription from the response
      const transcription = data?.formattedTranscription || data?.rawTranscription?.text || "";
      logger.log("Final transcription length:", transcription.length);
      
      if (onTranscriptionComplete && transcription) {
        onTranscriptionComplete(transcription);
      }
      
      return transcription;
      
    } catch (error) {
      logger.error('Transcription error:', error);
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
