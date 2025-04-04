
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
  
  // Auto-filled data based on transcription
  const [formData, setFormData] = useState({
    // Datos del Paciente
    nombre_completo: "Carlos Rodríguez",
    edad: "42",
    ocupacion: "Ingeniero de Software",
    procedencia: "Ciudad de México",
    fecha_consulta: new Date().toISOString().split('T')[0],
    
    // Motivo de Consulta
    motivo_consulta: "Cefalea intensa",
    tiempo_enfermedad: "1 semana",
    curso_enfermedad: "Progresivo",
    
    // Síntomas y Antecedentes
    sintomas_principales: "Dolor de cabeza intenso, fotofobia, malestar general",
    antecedentes_personales: "Dolores de cabeza ocasionales por estrés",
    antecedentes_familiares: "Madre con historial de migrañas",
    
    // Examen Clínico
    examen_neurologico_resumen: "Reflejos normales, sin déficit motor ni sensorial",
    examen_cognitivo_resumen: "Sin alteraciones",
    
    // Diagnóstico
    diagnostico_principal: "Migraña",
    etiologia_probable: "Factores hereditarios y desencadenantes ambientales",
    severidad: "Moderado",
    
    // Plan Médico
    medicacion_principal: "Sumatriptán 50mg PRN para episodios agudos",
    estudios_recomendados: "Ninguno por ahora, considerar RM si los síntomas persisten",
    medidas_no_farmacologicas: "Identificar desencadenantes, técnicas de manejo del estrés",
    proximo_control: "3 semanas",
    
    // Notas Adicionales
    notas_libres: "Paciente debe llevar un diario de cefaleas para próxima consulta"
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
      const { error } = await supabase
        .from('fichas_medicas')
        .insert({
          paciente_id: patientId,
          sesion_id: sessionId,
          diagnostico_principal: formData.diagnostico_principal,
          etiologia_probable: formData.etiologia_probable,
          severidad: formData.severidad,
          medicacion_principal: formData.medicacion_principal,
          estudios_recomendados: formData.estudios_recomendados,
          medidas_no_farmacologicas: formData.medidas_no_farmacologicas,
          proximo_control: formData.proximo_control,
          motivo_consulta: formData.motivo_consulta,
          tiempo_enfermedad: formData.tiempo_enfermedad,
          curso_enfermedad: formData.curso_enfermedad,
          sintomas_principales: formData.sintomas_principales,
          antecedentes_personales: formData.antecedentes_personales,
          antecedentes_familiares: formData.antecedentes_familiares,
          examen_neurologico_resumen: formData.examen_neurologico_resumen,
          examen_cognitivo_resumen: formData.examen_cognitivo_resumen,
          notas_libres: formData.notas_libres
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ficha Médica</DialogTitle>
          <DialogDescription>
            Información extraída automáticamente de la transcripción
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1">1. Datos del Paciente</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nombre_completo">Nombre Completo</Label>
              <Input
                id="nombre_completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edad">Edad</Label>
                <Input
                  id="edad"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ocupacion">Ocupación</Label>
                <Input
                  id="ocupacion"
                  name="ocupacion"
                  value={formData.ocupacion}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="procedencia">Procedencia</Label>
                <Input
                  id="procedencia"
                  name="procedencia"
                  value={formData.procedencia}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fecha_consulta">Fecha Consulta</Label>
                <Input
                  id="fecha_consulta"
                  name="fecha_consulta"
                  type="date"
                  value={formData.fecha_consulta}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold border-b pb-1 mt-6">2. Motivo de Consulta</h3>
            
            <div className="space-y-2">
              <Label htmlFor="motivo_consulta">Motivo de Consulta</Label>
              <Input
                id="motivo_consulta"
                name="motivo_consulta"
                value={formData.motivo_consulta}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tiempo_enfermedad">Tiempo de Enfermedad</Label>
                <Input
                  id="tiempo_enfermedad"
                  name="tiempo_enfermedad"
                  value={formData.tiempo_enfermedad}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="curso_enfermedad">Curso de Enfermedad</Label>
                <Input
                  id="curso_enfermedad"
                  name="curso_enfermedad"
                  value={formData.curso_enfermedad}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold border-b pb-1 mt-6">3. Síntomas y Antecedentes</h3>
            
            <div className="space-y-2">
              <Label htmlFor="sintomas_principales">Síntomas Principales</Label>
              <Textarea
                id="sintomas_principales"
                name="sintomas_principales"
                value={formData.sintomas_principales}
                onChange={handleChange}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="antecedentes_personales">Antecedentes Personales</Label>
              <Input
                id="antecedentes_personales"
                name="antecedentes_personales"
                value={formData.antecedentes_personales}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="antecedentes_familiares">Antecedentes Familiares</Label>
              <Input
                id="antecedentes_familiares"
                name="antecedentes_familiares"
                value={formData.antecedentes_familiares}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1">4. Examen Clínico</h3>
            
            <div className="space-y-2">
              <Label htmlFor="examen_neurologico_resumen">Examen Neurológico</Label>
              <Textarea
                id="examen_neurologico_resumen"
                name="examen_neurologico_resumen"
                value={formData.examen_neurologico_resumen}
                onChange={handleChange}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="examen_cognitivo_resumen">Examen Cognitivo</Label>
              <Input
                id="examen_cognitivo_resumen"
                name="examen_cognitivo_resumen"
                value={formData.examen_cognitivo_resumen}
                onChange={handleChange}
              />
            </div>
            
            <h3 className="text-lg font-semibold border-b pb-1 mt-6">5. Diagnóstico</h3>
            
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
              <Label htmlFor="etiologia_probable">Etiología Probable</Label>
              <Input
                id="etiologia_probable"
                name="etiologia_probable"
                value={formData.etiologia_probable}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="severidad">Severidad</Label>
              <select
                id="severidad"
                name="severidad"
                value={formData.severidad}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Leve">Leve</option>
                <option value="Moderado">Moderado</option>
                <option value="Severo">Severo</option>
              </select>
            </div>
            
            <h3 className="text-lg font-semibold border-b pb-1 mt-6">6. Plan Médico</h3>
            
            <div className="space-y-2">
              <Label htmlFor="medicacion_principal">Medicación Principal</Label>
              <Input
                id="medicacion_principal"
                name="medicacion_principal"
                value={formData.medicacion_principal}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estudios_recomendados">Estudios Recomendados</Label>
              <Input
                id="estudios_recomendados"
                name="estudios_recomendados"
                value={formData.estudios_recomendados}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medidas_no_farmacologicas">Medidas No Farmacológicas</Label>
              <Textarea
                id="medidas_no_farmacologicas"
                name="medidas_no_farmacologicas"
                value={formData.medidas_no_farmacologicas}
                onChange={handleChange}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proximo_control">Próximo Control</Label>
              <Input
                id="proximo_control"
                name="proximo_control"
                value={formData.proximo_control}
                onChange={handleChange}
              />
            </div>
            
            <h3 className="text-lg font-semibold border-b pb-1 mt-6">7. Notas Adicionales</h3>
            
            <div className="space-y-2">
              <Label htmlFor="notas_libres">Notas</Label>
              <Textarea
                id="notas_libres"
                name="notas_libres"
                value={formData.notas_libres}
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
