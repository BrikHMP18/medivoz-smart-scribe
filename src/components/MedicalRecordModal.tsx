
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TranscriptionSnippet } from "./medical-record/TranscriptionSnippet";
import { MedicalRecordForm } from "./medical-record/MedicalRecordForm";
import { MedicalRecordActions } from "./medical-record/MedicalRecordActions";
import { PatientInfoCard } from "./medical-record/PatientInfoCard";
import { useMedicalRecord } from "@/hooks/use-medical-record";
import { useMedicalRecordAutoFill } from "@/hooks/use-medical-record-auto-fill";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Sparkles } from "lucide-react";
import { useEffect } from "react";

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
    setFormData
  } = useMedicalRecord(sessionId || null, patientId || null);

  const {
    isAutoFilling,
    autoFillMedicalRecord
  } = useMedicalRecordAutoFill();

  const handleSaveAndClose = async () => {
    const success = await handleSave();
    if (success) {
      onOpenChange(false);
    }
  };

  const handleAutoFill = async () => {
    if (!fullTranscription) {
      return;
    }
    
    const medicalRecordData = await autoFillMedicalRecord(fullTranscription);
    
    if (medicalRecordData) {
      setFormData(medicalRecordData);
    }
  };

  // Auto-trigger the auto-fill when the modal opens and there's transcription available
  useEffect(() => {
    if (open && fullTranscription && !formData.motivo_consulta) {
      handleAutoFill();
    }
  }, [open, fullTranscription]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl md:text-2xl">Ficha Médica</DialogTitle>
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

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Transcripción de la consulta</h3>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoFill}
            disabled={isAutoFilling || !fullTranscription}
            className="flex items-center gap-1 text-xs h-8"
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

        <div className="grid grid-cols-1 gap-6 py-4">
          <MedicalRecordForm formData={formData} onChange={handleChange} />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
          <MedicalRecordActions
            isSaving={isSaving}
            isExporting={isExporting}
            onClose={() => onOpenChange(false)}
            onSave={handleSaveAndClose}
            onExport={handleExportPDF}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
