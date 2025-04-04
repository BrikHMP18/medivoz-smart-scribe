
import { useState } from "react";
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
import { Save, Download, X, Loader2 } from "lucide-react";
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
  
  // Simplified form data to match our new database structure
  const [formData, setFormData] = useState({
    motivo_consulta: "Cefalea intensa",
    diagnostico_principal: "Migraña",
    plan_tratamiento: "Sumatriptán 50mg PRN para episodios agudos. Identificar desencadenantes y técnicas de manejo del estrés. Próximo control en 3 semanas.",
    notas_adicionales: "Paciente debe llevar un diario de cefaleas para próxima consulta"
  });

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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnostico_principal">Diagnóstico Principal</Label>
              <Input
                id="diagnostico_principal"
                name="diagnostico_principal"
                value={formData.diagnostico_principal}
                onChange={handleChange}
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
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cerrar sin guardar
          </Button>
          <div className="space-x-2">
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
