
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MedicalRecordData } from "./types";

export const invokeAutoFillFunction = async (
  transcription: string,
  controller: AbortController
): Promise<MedicalRecordData | null> => {
  if (!transcription || transcription.trim().length < 20) {
    console.error("Transcription too short:", transcription);
    toast.error("La transcripción es demasiado corta para ser analizada");
    return null;
  }

  console.log("Sending transcription to AI for analysis, length:", transcription.length);
  console.log("First 100 chars:", transcription.substring(0, 100));
  
  try {
    const { data, error } = await supabase.functions.invoke('auto-fill-medical-record', {
      body: { transcription },
      signal: controller.signal
    });
    
    if (error) {
      console.error("Error invocando función de auto-rellenado:", error);
      throw error;
    }
    
    if (!data?.medicalRecord) {
      console.error("No medical record data returned from API:", data);
      throw new Error("No se pudo generar la ficha médica automáticamente");
    }
    
    console.log("Received medical record data from AI:", data.medicalRecord);
    
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
    } else {
      toast.success("Ficha médica generada exitosamente");
    }
    
    return medicalRecord;
  } catch (error: any) {
    if (controller.signal.aborted) {
      console.error("La solicitud de auto-rellenado ha excedido el tiempo límite");
      throw new Error("Auto-fill request timed out");
    }
    throw error;
  }
};
