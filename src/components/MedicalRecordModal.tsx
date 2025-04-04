
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TranscriptionSnippet } from "./medical-record/TranscriptionSnippet";
import { MedicalRecordForm } from "./medical-record/MedicalRecordForm";
import { MedicalRecordActions } from "./medical-record/MedicalRecordActions";
import { useMedicalRecord } from "@/hooks/use-medical-record";

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
    transcriptionSnippet, 
    isSaving, 
    isExporting, 
    handleChange, 
    handleSave, 
    handleExportPDF 
  } = useMedicalRecord(sessionId || null, patientId || null);

  const handleSaveAndClose = async () => {
    const success = await handleSave();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ficha Médica</DialogTitle>
          <DialogDescription>
            Información extraída automáticamente de la transcripción
          </DialogDescription>
        </DialogHeader>

        <TranscriptionSnippet transcriptionSnippet={transcriptionSnippet} />

        <div className="grid grid-cols-1 gap-6 py-4">
          <MedicalRecordForm formData={formData} onChange={handleChange} />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
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
