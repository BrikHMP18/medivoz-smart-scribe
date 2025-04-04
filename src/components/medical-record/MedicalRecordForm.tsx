
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
        <h3 className="text-lg font-semibold border-b pb-1">Datos Clínicos</h3>
        
        <div className="space-y-2">
          <Label htmlFor="motivo_consulta">Motivo de Consulta</Label>
          <Input
            id="motivo_consulta"
            name="motivo_consulta"
            value={formData.motivo_consulta}
            onChange={onChange}
            placeholder="Describa el motivo principal de la consulta"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="diagnostico_principal">Diagnóstico Principal</Label>
          <Input
            id="diagnostico_principal"
            name="diagnostico_principal"
            value={formData.diagnostico_principal}
            onChange={onChange}
            placeholder="Ingrese el diagnóstico principal"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sintomas_principales">Síntomas Principales</Label>
          <Textarea
            id="sintomas_principales"
            name="sintomas_principales"
            value={formData.sintomas_principales}
            onChange={onChange}
            rows={3}
            placeholder="Describa los síntomas principales del paciente"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="antecedentes_relevantes">Antecedentes Relevantes</Label>
          <Textarea
            id="antecedentes_relevantes"
            name="antecedentes_relevantes"
            value={formData.antecedentes_relevantes}
            onChange={onChange}
            rows={3}
            placeholder="Mencione los antecedentes relevantes del paciente"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="plan_tratamiento">Plan de Tratamiento</Label>
          <Textarea
            id="plan_tratamiento"
            name="plan_tratamiento"
            value={formData.plan_tratamiento}
            onChange={onChange}
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
            onChange={onChange}
            rows={3}
            placeholder="Ingrese observaciones adicionales relevantes"
          />
        </div>
      </div>
    </div>
  );
}
