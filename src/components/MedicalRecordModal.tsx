
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TranscriptionSnippet } from "./medical-record/TranscriptionSnippet";
import { MedicalRecordForm } from "./medical-record/MedicalRecordForm";
import { MedicalRecordActions } from "./medical-record/MedicalRecordActions";
import { PatientInfoCard } from "./medical-record/PatientInfoCard";
import { useMedicalRecord } from "@/hooks/medical-record/use-medical-record";
import { useMedicalRecordAutoFill } from "@/hooks/use-medical-record-auto-fill";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

interface MedicalRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string | null;
  sessionId?: string | null;
}

export function MedicalRecordModal({ 
  open, 
  onOpenChange, 
  patientId, 
  sessionId 
}: MedicalRecordModalProps) {
  const [autoFilledOnce, setAutoFilledOnce] = useState(false);
  const autoFillAttempted = useRef(false);
  const autoFillTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptionChecks = useRef<number>(0);
  const maxTranscriptionChecks = 5; // Maximum number of retries
  
  const { 
    formData, 
    patientData,
    transcriptionSnippet, 
    fullTranscription,
    showFullTranscription,
    isSaving, 
    isExporting, 
    handleChange, 
    toggleTranscriptionView,
    handleSave, 
    handleExportPDF,
    setFormData,
    recordExists,
    refreshTranscription
  } = useMedicalRecord(sessionId || null, patientId || null);

  const {
    isAutoFilling,
    autoFillMedicalRecord
  } = useMedicalRecordAutoFill();

  const handleSaveAndClose = async () => {
    if (!patientId || !sessionId) {
      toast.error("No hay un paciente o sesión seleccionada");
      return;
    }
    
    const success = await handleSave();
    if (success) {
      onOpenChange(false);
    }
  };

  const handleExportPDFClick = async () => {
    if (!patientId || !sessionId) {
      toast.error("No hay un paciente o sesión seleccionada");
      return;
    }
    
    await handleExportPDF();
  };

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
      if (refreshTranscription) {
        await refreshTranscription();
      }
      
      // Schedule next check
      return new Promise<boolean>(resolve => {
        autoFillTimeoutRef.current = setTimeout(async () => {
          const result = await checkAndAutoFillWithRetry();
          resolve(result);
        }, 2000); // Retry after 2 seconds
      });
    } else {
      console.log("Transcription not available after maximum retries");
      toast.warn("No se pudo obtener la transcripción completa para análisis automático");
      return false;
    }
  };

  // Auto-trigger the auto-fill when the modal opens for the first time and transcription is available
  useEffect(() => {
    if (open && !autoFilledOnce && !autoFillAttempted.current && 
        !formData.motivo_consulta) {
      console.log("Auto-filling medical record on modal open");
      
      // Mark that we've tried auto-filling
      autoFillAttempted.current = true;
      transcriptionChecks.current = 0;
      
      // Add a delay to ensure transcription is fully processed
      if (autoFillTimeoutRef.current) {
        clearTimeout(autoFillTimeoutRef.current);
      }
      
      autoFillTimeoutRef.current = setTimeout(() => {
        checkAndAutoFillWithRetry();
      }, 1000);
    }
    
    // Clean up timeout when component unmounts or modal closes
    return () => {
      if (autoFillTimeoutRef.current) {
        clearTimeout(autoFillTimeoutRef.current);
        autoFillTimeoutRef.current = null;
      }
    };
  }, [open, fullTranscription, autoFilledOnce, formData.motivo_consulta]);

  // Reset the attempt status when the modal is closed
  useEffect(() => {
    if (!open) {
      autoFillAttempted.current = false;
      transcriptionChecks.current = 0;
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl md:text-2xl text-primary">Ficha Médica</DialogTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
              Sesión: {sessionId?.substring(0, 8) || "Nueva"}
            </Badge>
          </div>
          <DialogDescription className="text-sm md:text-base">
            Información extraída automáticamente de la transcripción
          </DialogDescription>
        </DialogHeader>

        {patientData && (
          <PatientInfoCard 
            name={patientData.nombre} 
            age={patientData.edad} 
            occupation={patientData.ocupacion} 
            location={patientData.procedencia} 
          />
        )}

        <div className="flex items-center justify-between mb-2 mt-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            Transcripción de la consulta
            <Badge variant="outline" className="text-xs ml-2 bg-muted/50">
              {(fullTranscription?.length || 0).toLocaleString()} caracteres
            </Badge>
          </h3>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoFill}
            disabled={isAutoFilling || !fullTranscription}
            className="flex items-center gap-1 text-xs h-8 bg-primary/5 hover:bg-primary/10 border-primary/20"
          >
            {isAutoFilling ? (
              <>
                <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1" />
                Procesando...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Auto-rellenar con IA
              </>
            )}
          </Button>
        </div>

        <TranscriptionSnippet 
          transcriptionSnippet={transcriptionSnippet}
          fullTranscription={fullTranscription}
          showFullTranscription={showFullTranscription}
          onToggleTranscription={toggleTranscriptionView}
        />

        <div className="grid grid-cols-1 gap-6 py-4 mt-2">
          <MedicalRecordForm formData={formData} onChange={handleChange} />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
          <MedicalRecordActions
            isSaving={isSaving}
            isExporting={isExporting}
            onClose={() => onOpenChange(false)}
            onSave={handleSaveAndClose}
            onExport={handleExportPDFClick}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
