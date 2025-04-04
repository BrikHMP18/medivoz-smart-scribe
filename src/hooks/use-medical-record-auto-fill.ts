
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
    if (!transcription) {
      toast.error("No hay transcripción para analizar");
      return null;
    }
    
    setIsAutoFilling(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('auto-fill-medical-record', {
        body: { transcription }
      });
      
      if (error) {
        console.error("Error invoking auto-fill function:", error);
        toast.error("Error al auto-rellenar la ficha médica");
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
      
      setAutoFillData(medicalRecord);
      
      toast.success("Ficha médica generada automáticamente");
      return medicalRecord;
    } catch (error) {
      console.error("Error in autoFillMedicalRecord:", error);
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
