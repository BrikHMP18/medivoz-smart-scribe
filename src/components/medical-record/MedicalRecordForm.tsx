
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Stethoscope, Clipboard, Brain, Pill, NotebookText } from "lucide-react";

interface MedicalRecordFormData {
  motivo_consulta: string;
  diagnostico_principal: string;
  plan_tratamiento: string;
  notas_adicionales: string;
  sintomas_principales: string;
  antecedentes_relevantes: string;
}

interface MedicalRecordFormProps {
  formData: MedicalRecordFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function MedicalRecordForm({ formData, onChange }: MedicalRecordFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2 text-primary">
          <Stethoscope className="h-5 w-5" />
          Datos Clínicos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
            <Label htmlFor="motivo_consulta" className="flex items-center text-sm font-medium">
              <FileText className="h-4 w-4 mr-2 text-primary" />
              <span>Motivo de Consulta</span>
              <span className="ml-1 text-xs text-muted-foreground">(Auto-rellenado)</span>
            </Label>
            <Input
              id="motivo_consulta"
              name="motivo_consulta"
              value={formData.motivo_consulta}
              onChange={onChange}
              placeholder="Describa el motivo principal de la consulta"
              className="border-primary/20 focus-visible:ring-primary/30"
            />
          </div>
          
          <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
            <Label htmlFor="diagnostico_principal" className="flex items-center text-sm font-medium">
              <Brain className="h-4 w-4 mr-2 text-primary" />
              <span>Diagnóstico Principal</span>
              <span className="ml-1 text-xs text-muted-foreground">(Auto-calculado)</span>
            </Label>
            <Input
              id="diagnostico_principal"
              name="diagnostico_principal"
              value={formData.diagnostico_principal}
              onChange={onChange}
              placeholder="Ingrese el diagnóstico principal"
              className="border-primary/20 focus-visible:ring-primary/30"
            />
          </div>
        </div>
        
        <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
          <Label htmlFor="sintomas_principales" className="flex items-center text-sm font-medium">
            <Clipboard className="h-4 w-4 mr-2 text-primary" />
            <span>Síntomas Principales</span>
            <span className="ml-1 text-xs text-muted-foreground">(Auto-rellenado)</span>
          </Label>
          <Textarea
            id="sintomas_principales"
            name="sintomas_principales"
            value={formData.sintomas_principales}
            onChange={onChange}
            rows={3}
            placeholder="Describa los síntomas principales del paciente"
            className="resize-none border-primary/20 focus-visible:ring-primary/30"
          />
        </div>
        
        <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
          <Label htmlFor="antecedentes_relevantes" className="flex items-center text-sm font-medium">
            <NotebookText className="h-4 w-4 mr-2 text-primary" />
            <span>Antecedentes Relevantes</span>
            <span className="ml-1 text-xs text-muted-foreground">(Auto-rellenado)</span>
          </Label>
          <Textarea
            id="antecedentes_relevantes"
            name="antecedentes_relevantes"
            value={formData.antecedentes_relevantes}
            onChange={onChange}
            rows={3}
            placeholder="Mencione los antecedentes relevantes del paciente"
            className="resize-none border-primary/20 focus-visible:ring-primary/30"
          />
        </div>
        
        <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
          <Label htmlFor="plan_tratamiento" className="flex items-center text-sm font-medium">
            <Pill className="h-4 w-4 mr-2 text-primary" />
            <span>Plan de Tratamiento</span>
            <span className="ml-1 text-xs text-muted-foreground">(Generado por IA)</span>
          </Label>
          <ScrollArea className="h-[160px] border rounded-md p-2 border-primary/20">
            <Textarea
              id="plan_tratamiento"
              name="plan_tratamiento"
              value={formData.plan_tratamiento}
              onChange={onChange}
              rows={6}
              placeholder="Describa el plan de tratamiento, incluyendo medicación y recomendaciones"
              className="resize-none border-0 focus-visible:ring-0 p-0"
            />
          </ScrollArea>
        </div>
        
        <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
          <Label htmlFor="notas_adicionales" className="flex items-center text-sm font-medium">
            <FileText className="h-4 w-4 mr-2 text-primary" />
            <span>Notas Adicionales</span>
            <span className="ml-1 text-xs text-muted-foreground">(Auto-rellenado)</span>
          </Label>
          <Textarea
            id="notas_adicionales"
            name="notas_adicionales"
            value={formData.notas_adicionales}
            onChange={onChange}
            rows={3}
            placeholder="Ingrese observaciones adicionales relevantes"
            className="resize-none border-primary/20 focus-visible:ring-primary/30"
          />
        </div>
      </div>
    </div>
  );
}
