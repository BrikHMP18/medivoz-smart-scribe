
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MedicalRecordFormData } from "./types";
import { logger } from "@/utils/logger";

// Check if a medical record exists for the session and patient
export const checkRecordExists = async (sessionId: string, patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('fichas_medicas')
      .select('id')
      .eq('sesion_id', sessionId)
      .eq('paciente_id', patientId)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    logger.error("Error checking if record exists:", error);
    return false;
  }
};

// Fetch existing medical record data
export const fetchExistingRecord = async (sessionId: string, patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('fichas_medicas')
      .select('*')
      .eq('sesion_id', sessionId)
      .eq('paciente_id', patientId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      const formData: MedicalRecordFormData = {
        motivo_consulta: data.motivo_consulta || "",
        tiempo_enfermedad: data.tiempo_enfermedad || "",
        forma_inicio: data.forma_inicio || "",
        curso_enfermedad: data.curso_enfermedad || "",
        historia_cronologica: data.historia_cronologica || "",
        antecedentes: data.antecedentes || "",
        sintomas_principales: data.sintomas_principales || "",
        estado_funcional_basal: data.estado_funcional_basal || "",
        estudios_previos: data.estudios_previos || "",
        notas_adicionales: data.notas_adicionales || ""
      };
      
      toast.info("Ficha médica existente cargada");
      return formData;
    }
    
    return null;
  } catch (error) {
    logger.error("Error fetching existing record:", error);
    return null;
  }
};
