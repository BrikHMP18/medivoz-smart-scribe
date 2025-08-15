
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MedicalRecordFormData } from "./types";
import { updatePatientDiagnostic } from "./patient-api";

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
  
  if (!formData.motivo_consulta || !formData.diagnostico_principal || !formData.plan_tratamiento) {
    toast.error("Por favor, complete los campos obligatorios");
    return false;
  }
  
  setIsSaving(true);
  
  try {
    console.log("Attempting to save medical record, record exists:", recordExists);
    console.log("Session ID:", sessionId);
    console.log("Patient ID:", patientId);
    
    // Check if record already exists
    if (recordExists) {
      // Update existing record
      const { error } = await supabase
        .from('fichas_medicas')
        .update({
          motivo_consulta: formData.motivo_consulta,
          diagnostico_principal: formData.diagnostico_principal,
          plan_tratamiento: formData.plan_tratamiento,
          notas_adicionales: formData.notas_adicionales,
          sintomas_principales: formData.sintomas_principales,
          antecedentes_relevantes: formData.antecedentes_relevantes
        })
        .eq('sesion_id', sessionId)
        .eq('paciente_id', patientId);
      
      if (error) {
        console.error("Update error:", error);
        throw error;
      }
    } else {
      // Insert new record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      
      console.log("Inserting new record with data:", {
        paciente_id: patientId,
        sesion_id: sessionId,
        motivo_consulta: formData.motivo_consulta,
        diagnostico_principal: formData.diagnostico_principal,
        plan_tratamiento: formData.plan_tratamiento,
        doctor_id: user.id,
      });
      
      const { error } = await supabase
        .from('fichas_medicas')
        .insert({
          paciente_id: patientId,
          sesion_id: sessionId,
          motivo_consulta: formData.motivo_consulta,
          diagnostico_principal: formData.diagnostico_principal,
          plan_tratamiento: formData.plan_tratamiento,
          notas_adicionales: formData.notas_adicionales || null,
          sintomas_principales: formData.sintomas_principales || null,
          antecedentes_relevantes: formData.antecedentes_relevantes || null,
          doctor_id: user.id,
        });
      
      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
    }
    
    // Update the patient's diagnostico in the pacientes table
    const diagnosticUpdated = await updatePatientDiagnostic(patientId, formData.diagnostico_principal);
    if (!diagnosticUpdated) {
      console.warn("Failed to update patient's diagnostic information");
    }
    
    toast.success("Ficha médica guardada exitosamente");
    return true;
  } catch (error: any) {
    console.error("Error saving medical record:", error);
    toast.error(`Error al guardar la ficha médica: ${error.message || 'Error desconocido'}`);
    return false;
  } finally {
    setIsSaving(false);
  }
};
