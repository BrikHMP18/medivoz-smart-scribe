
import { Button } from "@/components/ui/button";
import { Save, Download, X, Loader2 } from "lucide-react";

interface MedicalRecordActionsProps {
  isSaving: boolean;
  isExporting: boolean;
  onClose: () => void;
  onSave: () => void;
  onExport: () => void;
}

export function MedicalRecordActions({ 
  isSaving, 
  isExporting, 
  onClose, 
  onSave, 
  onExport 
}: MedicalRecordActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-2">
      <Button variant="outline" onClick={onClose}>
        <X className="h-4 w-4 mr-2" />
        Cerrar sin guardar
      </Button>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onExport} variant="secondary" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </>
          )}
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
