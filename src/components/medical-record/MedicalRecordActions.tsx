
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
    <div className="flex flex-col sm:flex-row justify-between gap-2 w-full">
      <Button variant="outline" onClick={onClose} className="flex-shrink-0">
        <X className="h-4 w-4 mr-2" />
        Cerrar sin guardar
      </Button>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onExport} variant="secondary" disabled={isExporting} className="flex-1">
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
        <Button onClick={onSave} disabled={isSaving} className="flex-1 bg-primary hover:bg-primary/90">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Ficha
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
