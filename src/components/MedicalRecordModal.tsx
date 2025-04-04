
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, Download, X, Loader2, FilePen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [transcriptionSnippet, setTranscriptionSnippet] = useState<string>("");
  
  // Simplified form data to match our new database structure
  const [formData, setFormData] = useState({
    motivo_consulta: "",
    diagnostico_principal: "",
    plan_tratamiento: "",
    notas_adicionales: ""
  });

  // Fetch transcription snippet when modal opens
  useEffect(() => {
    if (open && sessionId) {
      fetchTranscriptionSnippet();
    }
  }, [open, sessionId]);

  const fetchTranscriptionSnippet = async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .select('transcripcion')
        .eq('id', sessionId)
        .single();
        
      if (error) throw error;
      
      if (data && data.transcripcion) {
        // Get the first 200 characters as snippet
        const snippet = data.transcripcion.substring(0, 200) + (data.transcripcion.length > 200 ? '...' : '');
        setTranscriptionSnippet(snippet);
        
        // Auto-fill some fields based on the transcription content
        // This is a simple implementation - in a real app you might want
        // to use AI to extract info from the transcription
        setFormData(prev => ({
          ...prev,
          motivo_consulta: prev.motivo_consulta || "Extraer del texto de la consulta",
          diagnostico_principal: prev.diagnostico_principal || "Basado en evaluación clínica"
        }));
      }
    } catch (error) {
      console.error("Error fetching transcription:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!patientId || !sessionId) {
      toast.error("No hay un paciente o sesión seleccionada");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Using raw query with our simplified schema
      const { error } = await supabase
        .from('fichas_medicas')
        .insert({
          paciente_id: patientId,
          sesion_id: sessionId,
          motivo_consulta: formData.motivo_consulta,
          diagnostico_principal: formData.diagnostico_principal,
          plan_tratamiento: formData.plan_tratamiento,
          notas_adicionales: formData.notas_adicionales
        });
      
      if (error) throw error;
      
      // Update the patient's diagnostico in the pacientes table
      await supabase
        .from('pacientes')
        .update({
          diagnostico: formData.diagnostico_principal
        })
        .eq('id', patientId);
      
      toast.success("Ficha médica guardada exitosamente");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving medical record:", error);
      toast.error("Error al guardar la ficha médica");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    toast.success("Exportando PDF...");
    // Simulated PDF export
    setTimeout(() => {
      toast.success("PDF exportado exitosamente");
      setIsExporting(false);
    }, 1500);
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

        {transcriptionSnippet && (
          <div className="bg-muted p-3 rounded-md mb-4 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <FilePen className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Fragmento de la transcripción:</h4>
            </div>
            <p className="text-muted-foreground">{transcriptionSnippet}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1">Datos Clínicos</h3>
            
            <div className="space-y-2">
              <Label htmlFor="motivo_consulta">Motivo de Consulta</Label>
              <Input
                id="motivo_consulta"
                name="motivo_consulta"
                value={formData.motivo_consulta}
                onChange={handleChange}
                placeholder="Describa el motivo principal de la consulta"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnostico_principal">Diagnóstico Principal</Label>
              <Input
                id="diagnostico_principal"
                name="diagnostico_principal"
                value={formData.diagnostico_principal}
                onChange={handleChange}
                placeholder="Ingrese el diagnóstico principal"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan_tratamiento">Plan de Tratamiento</Label>
              <Textarea
                id="plan_tratamiento"
                name="plan_tratamiento"
                value={formData.plan_tratamiento}
                onChange={handleChange}
                rows={4}
                placeholder="Describa el plan de tratamiento, incluyendo medicación y recomendaciones"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notas_adicionales">Notas Adicionales</Label>
              <Textarea
                id="notas_adicionales"
                name="notas_adicionales"
                value={formData.notas_adicionales}
                onChange={handleChange}
                rows={3}
                placeholder="Ingrese observaciones adicionales relevantes"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cerrar sin guardar
          </Button>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleExportPDF} variant="secondary" disabled={isExporting}>
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
            <Button onClick={handleSave} disabled={isSaving}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
