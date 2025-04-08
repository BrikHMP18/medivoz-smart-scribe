
import { useState } from "react";
import { toast } from "sonner";
import { MedicalRecordData, AutoFillState } from "./types";
import { invokeAutoFillFunction } from "./api";
import { createTimeoutController } from "./timeout-utils";

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
      // Create an AbortController for timeout handling
      const { controller, timeoutId, clearTimeout } = createTimeoutController(30000);
      
      try {
        const medicalRecord = await invokeAutoFillFunction(transcription, controller);
        
        // Clear the timeout since the request completed
        clearTimeout();
        
        if (medicalRecord) {
          setAutoFillData(medicalRecord);
          return medicalRecord;
        }
        
        return null;
      } catch (abortError) {
        // Clear the timeout to prevent memory leaks
        clearTimeout();
        throw abortError;
      }
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
