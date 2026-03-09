
import { supabase } from "@/integrations/supabase/client";
import { PatientData } from "./types";
import { logger } from "@/utils/logger";

// Fetch patient data
export const fetchPatientData = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .select('nombre, edad, ocupacion, procedencia')
      .eq('id', patientId)
      .single();
      
    if (error) throw error;
    
    return data as PatientData;
  } catch (error) {
    logger.error("Error fetching patient data:", error);
    return null;
  }
};

// Update patient's diagnostic information
export const updatePatientDiagnostic = async (patientId: string, diagnostico: string) => {
  try {
    const { error } = await supabase
      .from('pacientes')
      .update({
        diagnostico: diagnostico
      })
      .eq('id', patientId);
    
    if (error) {
      logger.warn("Error updating patient diagnostico:", error);
      return false;
    }
    return true;
  } catch (error) {
    logger.error("Error updating patient diagnostic:", error);
    return false;
  }
};
