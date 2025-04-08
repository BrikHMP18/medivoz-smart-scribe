
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
      console.error("Transcription too short:", transcription);
      toast.error("La transcripción es demasiado corta para ser analizada");
      return null;
    }
    
    setIsAutoFilling(true);
    toast.info("Analizando transcripción con IA...");
    
    try {
      console.log("Sending transcription to AI for analysis, length:", transcription.length);
      console.log("First 100 chars:", transcription.substring(0, 100));
      
      // Initialize timeout handling
      let timeoutId: NodeJS.Timeout | null = null;
      
      // Create a promise that will reject after the timeout
      const timeoutPromise = new Promise<null>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Auto-fill request timed out"));
        }, 30000); // 30 seconds timeout
      });
      
      // Create the actual request promise
      const requestPromise = new Promise<MedicalRecordData | null>(async (resolve, reject) => {
        try {
          const { data, error } = await supabase.functions.invoke('auto-fill-medical-record', {
            body: { transcription }
          });
          
          if (error) {
            console.error("Error invocando función de auto-rellenado:", error);
            reject(error);
            return;
          }
          
          if (!data?.medicalRecord) {
            console.error("No medical record data returned from API:", data);
            reject(new Error("No se pudo generar la ficha médica automáticamente"));
            return;
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
          
          resolve(medicalRecord);
        } catch (error) {
          reject(error);
        }
      });
      
      // Race the request against the timeout
      const medicalRecord = await Promise.race([requestPromise, timeoutPromise]) as MedicalRecordData | null;
      
      // Clear the timeout if the request completed
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Validate data
      if (medicalRecord && (!medicalRecord.motivo_consulta || !medicalRecord.diagnostico_principal)) {
        console.warn("Auto-fill returned incomplete data:", medicalRecord);
        toast.warning("La IA generó información incompleta. Revise y complete los campos manualmente.");
      } else if (medicalRecord) {
        toast.success("Ficha médica generada exitosamente");
      }
      
      setAutoFillData(medicalRecord);
      return medicalRecord;
    } catch (error: any) {
      // Check if it's a timeout error
      if (error.message === "Auto-fill request timed out") {
        console.error("La solicitud de auto-rellenado ha excedido el tiempo límite");
        toast.error("La solicitud ha tardado demasiado tiempo. Intente nuevamente");
      } else {
        console.error("Error en autoFillMedicalRecord:", error);
        toast.error("Error al procesar la transcripción: " + (error.message || "Error desconocido"));
      }
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
