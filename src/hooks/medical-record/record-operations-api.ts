
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MedicalRecordFormData } from "./types";
import { updatePatientDiagnostic } from "./patient-api";

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
