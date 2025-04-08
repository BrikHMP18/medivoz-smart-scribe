
import { supabase } from "@/integrations/supabase/client";

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
    console.error("Error fetching transcription:", error);
    return null;
  }
};
