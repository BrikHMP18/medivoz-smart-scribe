
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

// Fetch transcription data from the session
export const fetchTranscriptionData = async (sessionId: string) => {
  try {
    const { data, error } = await supabase
      .from('sesiones')
      .select('transcripcion')
      .eq('id', sessionId)
      .single();
      
    if (error) throw error;
    
    if (data && data.transcripcion) {
      return data.transcripcion;
    }
    return null;
  } catch (error) {
    logger.error("Error fetching transcription:", error);
    return null;
  }
};
