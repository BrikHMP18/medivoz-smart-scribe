
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MedicalRecordFormData } from "./types";
import { logger } from "@/utils/logger";

// Save medical record data
export const saveMedicalRecord = async (
  formData: MedicalRecordFormData,
  patientId: string,
  sessionId: string,
  recordExists: boolean,
  setIsSaving: (value: boolean) => void
) => {
  if (!patientId || !sessionId) {
    toast.error("No hay un paciente o sesión seleccionada");
    return false;
  }
  
  if (!formData.motivo_consulta || !formData.historia_cronologica) {
    toast.error("Por favor, complete el motivo de consulta y la historia cronológica");
    return false;
  }
  
  setIsSaving(true);
  
  try {
    logger.log("Attempting to save medical record, record exists:", recordExists);
    logger.log("Session ID:", sessionId);
    logger.log("Patient ID:", patientId);
    
    // Check if record already exists
    if (recordExists) {
      // Update existing record
      const { error } = await supabase
        .from('fichas_medicas')
        .update({
          motivo_consulta: formData.motivo_consulta,
          tiempo_enfermedad: formData.tiempo_enfermedad,
          forma_inicio: formData.forma_inicio,
          curso_enfermedad: formData.curso_enfermedad,
          historia_cronologica: formData.historia_cronologica,
          antecedentes: formData.antecedentes,
          sintomas_principales: formData.sintomas_principales,
          estado_funcional_basal: formData.estado_funcional_basal,
          estudios_previos: formData.estudios_previos,
          notas_adicionales: formData.notas_adicionales
        })
        .eq('sesion_id', sessionId)
        .eq('paciente_id', patientId);
      
      if (error) {
        logger.error("Update error:", error);
        throw error;
      }
    } else {
      // Insert new record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      
      logger.log("Inserting new record with data:", {
        paciente_id: patientId,
        sesion_id: sessionId,
        motivo_consulta: formData.motivo_consulta,
        doctor_id: user.id,
      });
      
      const { error } = await supabase
        .from('fichas_medicas')
        .insert({
          paciente_id: patientId,
          sesion_id: sessionId,
          motivo_consulta: formData.motivo_consulta,
          tiempo_enfermedad: formData.tiempo_enfermedad || null,
          forma_inicio: formData.forma_inicio || null,
          curso_enfermedad: formData.curso_enfermedad || null,
          historia_cronologica: formData.historia_cronologica || null,
          antecedentes: formData.antecedentes || null,
          sintomas_principales: formData.sintomas_principales || null,
          estado_funcional_basal: formData.estado_funcional_basal || null,
          estudios_previos: formData.estudios_previos || null,
          notas_adicionales: formData.notas_adicionales || null,
          doctor_id: user.id,
        });
      
      if (error) {
        logger.error("Insert error:", error);
        throw error;
      }
    }
    
    toast.success("Ficha médica guardada exitosamente");
    return true;
  } catch (error: unknown) {
    logger.error("Error saving medical record:", error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    toast.error(`Error al guardar la ficha médica: ${errorMessage}`);
    return false;
  } finally {
    setIsSaving(false);
  }
};
