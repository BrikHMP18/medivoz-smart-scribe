
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
    if (!transcription || transcription.trim().length < 10) {
      toast.error("La transcripción es demasiado corta para analizar");
      return null;
    }
    
    setIsAutoFilling(true);
    toast.info("Generando ficha médica automáticamente...", {
      duration: 5000
    });
    
    try {
      console.log("Iniciando auto-relleno de ficha médica con transcripción de longitud:", transcription.length);
      
      const { data, error } = await supabase.functions.invoke('auto-fill-medical-record', {
        body: { transcription }
      });
      
      if (error) {
        console.error("Error invocando función de auto-relleno:", error);
        toast.error("Error al auto-rellenar la ficha médica: " + (error.message || "Error desconocido"));
        return null;
      }
      
      if (!data?.medicalRecord) {
        console.error("Respuesta de auto-relleno sin datos:", data);
        toast.error("No se pudo generar la ficha médica automáticamente");
        return null;
      }
      
      console.log("Datos de ficha médica recibidos:", data.medicalRecord);
      
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
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error en autoFillMedicalRecord:", error);
      toast.error(`Error al procesar la transcripción: ${errorMessage}`);
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
