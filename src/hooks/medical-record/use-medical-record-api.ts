
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MedicalRecordFormData {
  motivo_consulta: string;
  diagnostico_principal: string;
  plan_tratamiento: string;
  notas_adicionales: string;
  sintomas_principales: string;
  antecedentes_relevantes: string;
}

interface PatientData {
  nombre: string;
  edad: number | null;
  ocupacion: string | null;
  procedencia: string | null;
}

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
    console.error("Error checking if record exists:", error);
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
        diagnostico_principal: data.diagnostico_principal || "",
        plan_tratamiento: data.plan_tratamiento || "",
        notas_adicionales: data.notas_adicionales || "",
        sintomas_principales: data.sintomas_principales || "",
        antecedentes_relevantes: data.antecedentes_relevantes || ""
      };
      
      toast.info("Ficha médica existente cargada");
      return formData;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching existing record:", error);
    return null;
  }
};

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
    console.error("Error fetching patient data:", error);
    return null;
  }
};

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
      
      if (error) throw error;
    } else {
      // Insert new record
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
          antecedentes_relevantes: formData.antecedentes_relevantes || null
        });
      
      if (error) throw error;
    }
    
    // Update the patient's diagnostico in the pacientes table
    const { error } = await supabase
      .from('pacientes')
      .update({
        diagnostico: formData.diagnostico_principal
      })
      .eq('id', patientId);
    
    if (error) {
      console.warn("Error updating patient diagnostico:", error);
    }
    
    toast.success("Ficha médica guardada exitosamente");
    return true;
  } catch (error) {
    console.error("Error saving medical record:", error);
    toast.error("Error al guardar la ficha médica");
    return false;
  } finally {
    setIsSaving(false);
  }
};
