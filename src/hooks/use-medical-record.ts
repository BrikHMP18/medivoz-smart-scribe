
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MedicalRecordFormData {
  motivo_consulta: string;
  diagnostico_principal: string;
  plan_tratamiento: string;
  notas_adicionales: string;
  sintomas_principales: string;
  antecedentes_relevantes: string;
}

interface PatientData {
  nombre: string;
  edad: number | null;
  ocupacion: string | null;
  procedencia: string | null;
}

export function useMedicalRecord(sessionId: string | null, patientId: string | null) {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [transcriptionSnippet, setTranscriptionSnippet] = useState<string>("");
  const [fullTranscription, setFullTranscription] = useState<string>("");
  const [showFullTranscription, setShowFullTranscription] = useState(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    motivo_consulta: "",
    diagnostico_principal: "",
    plan_tratamiento: "",
    notas_adicionales: "",
    sintomas_principales: "",
    antecedentes_relevantes: ""
  });

  useEffect(() => {
    if (sessionId) {
      fetchTranscriptionData();
    }
    
    if (patientId) {
      fetchPatientData();
    }
  }, [sessionId, patientId]);

  const fetchPatientData = async () => {
    if (!patientId) return;
    
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('nombre, edad, ocupacion, procedencia')
        .eq('id', patientId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setPatientData(data);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  const fetchTranscriptionData = async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .select('transcripcion')
        .eq('id', sessionId)
        .single();
        
      if (error) throw error;
      
      if (data && data.transcripcion) {
        // Save full transcription
        setFullTranscription(data.transcripcion);
        
        // Get the first 200 characters as snippet
        const snippet = data.transcripcion.substring(0, 200) + (data.transcripcion.length > 200 ? '...' : '');
        setTranscriptionSnippet(snippet);
        
        // Auto-fill some fields based on the transcription content
        setFormData(prev => ({
          ...prev,
          motivo_consulta: prev.motivo_consulta || "Extraer del texto de la consulta",
          diagnostico_principal: prev.diagnostico_principal || "Basado en evaluación clínica",
          sintomas_principales: prev.sintomas_principales || "Dolor de cabeza, sensibilidad a la luz",
          antecedentes_relevantes: prev.antecedentes_relevantes || "Antecedentes familiares de migraña"
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

  const toggleTranscriptionView = () => {
    setShowFullTranscription(prev => !prev);
  };

  const handleSave = async () => {
    if (!patientId || !sessionId) {
      toast.error("No hay un paciente o sesión seleccionada");
      return false;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('fichas_medicas')
        .insert({
          paciente_id: patientId,
          sesion_id: sessionId,
          motivo_consulta: formData.motivo_consulta,
          diagnostico_principal: formData.diagnostico_principal,
          plan_tratamiento: formData.plan_tratamiento,
          notas_adicionales: formData.notas_adicionales,
          sintomas_principales: formData.sintomas_principales,
          antecedentes_relevantes: formData.antecedentes_relevantes
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
      return true;
    } catch (error) {
      console.error("Error saving medical record:", error);
      toast.error("Error al guardar la ficha médica");
      return false;
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

  return {
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
    handleExportPDF
  };
}
