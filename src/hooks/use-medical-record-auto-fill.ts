
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MedicalRecordData {
  motivo_consulta: string;
  diagnostico_principal: string;
  plan_tratamiento: string;
  notas_adicionales: string;
  sintomas_principales: string;
  antecedentes_relevantes: string;
}

export function useMedicalRecordAutoFill() {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillData, setAutoFillData] = useState<MedicalRecordData | null>(null);

  const autoFillMedicalRecord = async (transcription: string): Promise<MedicalRecordData | null> => {
    if (!transcription || transcription.trim().length < 20) {
      toast.error("La transcripción es demasiado corta para ser analizada");
      return null;
    }
    
    setIsAutoFilling(true);
    toast.info("Analizando transcripción con IA...");
    
    try {
      const { data, error } = await supabase.functions.invoke('auto-fill-medical-record', {
        body: { transcription }
      });
      
      if (error) {
        console.error("Error invocando función de auto-rellenado:", error);
        toast.error("Error al procesar la transcripción");
        return null;
      }
      
      if (!data?.medicalRecord) {
        toast.error("No se pudo generar la ficha médica automáticamente");
        return null;
      }
      
      const medicalRecord: MedicalRecordData = {
        motivo_consulta: data.medicalRecord.motivo_consulta || "",
        diagnostico_principal: data.medicalRecord.diagnostico_principal || "",
        plan_tratamiento: data.medicalRecord.plan_tratamiento || "",
        notas_adicionales: data.medicalRecord.notas_adicionales || "",
        sintomas_principales: data.medicalRecord.sintomas_principales || "",
        antecedentes_relevantes: data.medicalRecord.antecedentes_relevantes || ""
      };
      
      // Validate data
      if (!medicalRecord.motivo_consulta || !medicalRecord.diagnostico_principal) {
        console.warn("Auto-fill returned incomplete data:", medicalRecord);
        toast.warning("La IA generó información incompleta. Revise y complete los campos manualmente.");
      }
      
      setAutoFillData(medicalRecord);
      return medicalRecord;
    } catch (error) {
      console.error("Error en autoFillMedicalRecord:", error);
      toast.error("Error al procesar la transcripción");
      return null;
    } finally {
      setIsAutoFilling(false);
    }
  };

  return {
    isAutoFilling,
    autoFillData,
    autoFillMedicalRecord
  };
}
