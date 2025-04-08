import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMedicalRecordAutoFill } from "@/hooks/medical-record-auto-fill";
import { TranscriptionPanel } from "./TranscriptionPanel";
import { MedicalRecordForm } from "../medical-record/MedicalRecordForm";
import { MedicalRecordActions } from "../medical-record/MedicalRecordActions";
import { DialogFooter } from "../ui/dialog";
import { MedicalRecordFormData } from "@/hooks/medical-record/types";

interface MedicalRecordContainerProps {
  formData: MedicalRecordFormData;
  setFormData: (data: MedicalRecordFormData) => void;
  transcriptionSnippet: string;
  fullTranscription: string;
  showFullTranscription: boolean;
  toggleTranscriptionView: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isSaving: boolean;
  isExporting: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  onExport: () => Promise<void>;
  refreshTranscription: () => Promise<string>;
  patientId?: string | null;
  sessionId?: string | null;
}

export function MedicalRecordContainer({
  formData,
  setFormData,
  transcriptionSnippet,
  fullTranscription,
  showFullTranscription,
  toggleTranscriptionView,
  handleChange,
  isSaving,
  isExporting,
  onClose,
  onSave,
  onExport,
  refreshTranscription,
  patientId,
  sessionId
}: MedicalRecordContainerProps) {
  const [autoFilledOnce, setAutoFilledOnce] = useState(false);
  const autoFillAttempted = useRef(false);
  const autoFillTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptionChecks = useRef<number>(0);
  const maxTranscriptionChecks = 5; // Maximum number of retries

  const {
    isAutoFilling,
    autoFillMedicalRecord
  } = useMedicalRecordAutoFill();

  const handleAutoFill = async () => {
    if (!fullTranscription) {
      toast.error("No hay transcripción para analizar");
      return;
    }
    
    if (isAutoFilling) {
      toast.info("Espere mientras se completa el análisis actual");
      return;
    }
    
    console.log("Manual auto-fill triggered with transcription length:", fullTranscription.length);
    const medicalRecordData = await autoFillMedicalRecord(fullTranscription);
    
    if (medicalRecordData) {
      setFormData(medicalRecordData);
      setAutoFilledOnce(true);
      toast.success("Ficha médica auto-rellenada exitosamente");
    }
  };

  // Check if transcription is available, and if not, retry a few times
  const checkAndAutoFillWithRetry = async () => {
    console.log("Checking transcription availability", { 
      attempt: transcriptionChecks.current + 1, 
      hasTranscription: !!fullTranscription,
      transcriptionLength: fullTranscription?.length || 0
    });
    
    if (fullTranscription && fullTranscription.length > 50) {
      console.log("Transcription found, proceeding with auto-fill");
      await handleAutoFill();
      return true;
    } else if (transcriptionChecks.current < maxTranscriptionChecks) {
      console.log("Transcription not available yet, refreshing and retrying...");
      transcriptionChecks.current += 1;
      
      // Try to refresh the transcription data
      const refreshedTranscription = await refreshTranscription();
      console.log("Refreshed transcription, length:", refreshedTranscription?.length || 0);
      
      // Schedule next check
      return new Promise<boolean>(resolve => {
        autoFillTimeoutRef.current = setTimeout(async () => {
          const result = await checkAndAutoFillWithRetry();
          resolve(result);
        }, 2000); // Retry after 2 seconds
      });
    } else {
      console.log("Transcription not available after maximum retries");
      toast.warning("No se pudo obtener la transcripción completa para análisis automático");
      return false;
    }
  };

  // Auto-trigger the auto-fill when the modal opens for the first time and transcription is available
  useEffect(() => {
    if (!formData.motivo_consulta) {
      console.log("Auto-filling medical record on modal open");
      
      // Reset attempts on new modal open
      autoFillAttempted.current = false;
      transcriptionChecks.current = 0;
      
      if (!autoFillAttempted.current) {
        // Mark that we've tried auto-filling
        autoFillAttempted.current = true;
      
        // Add a delay to ensure transcription is fully processed
        if (autoFillTimeoutRef.current) {
          clearTimeout(autoFillTimeoutRef.current);
        }
        
        autoFillTimeoutRef.current = setTimeout(() => {
          checkAndAutoFillWithRetry();
        }, 1000);
      }
    }
    
    // Clean up timeout when component unmounts or modal closes
    return () => {
      if (autoFillTimeoutRef.current) {
        clearTimeout(autoFillTimeoutRef.current);
        autoFillTimeoutRef.current = null;
      }
    };
  }, [fullTranscription, formData.motivo_consulta]);

  return (
    <>
      <TranscriptionPanel 
        transcriptionSnippet={transcriptionSnippet}
        fullTranscription={fullTranscription}
        showFullTranscription={showFullTranscription}
        onToggleTranscription={toggleTranscriptionView}
        onAutoFill={handleAutoFill}
        isAutoFilling={isAutoFilling}
      />

      <div className="grid grid-cols-1 gap-6 py-4 mt-2">
        <MedicalRecordForm formData={formData} onChange={handleChange} />
      </div>

      <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
        <MedicalRecordActions
          isSaving={isSaving}
          isExporting={isExporting}
          onClose={onClose}
          onSave={onSave}
          onExport={onExport}
        />
      </DialogFooter>
    </>
  );
}
