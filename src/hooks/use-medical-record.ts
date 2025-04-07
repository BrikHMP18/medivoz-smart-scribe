
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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
  const [recordExists, setRecordExists] = useState(false);
  
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
      checkRecordExists();
    }
    
    if (patientId) {
      fetchPatientData();
    }
  }, [sessionId, patientId]);

  const checkRecordExists = async () => {
    if (!sessionId || !patientId) return;
    
    try {
      const { data, error } = await supabase
        .from('fichas_medicas')
        .select('id')
        .eq('sesion_id', sessionId)
        .eq('paciente_id', patientId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setRecordExists(true);
        // If record exists, fetch it
        fetchExistingRecord();
      } else {
        setRecordExists(false);
      }
    } catch (error) {
      console.error("Error checking if record exists:", error);
    }
  };

  const fetchExistingRecord = async () => {
    if (!sessionId || !patientId) return;
    
    try {
      const { data, error } = await supabase
        .from('fichas_medicas')
        .select('*')
        .eq('sesion_id', sessionId)
        .eq('paciente_id', patientId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setFormData({
          motivo_consulta: data.motivo_consulta || "",
          diagnostico_principal: data.diagnostico_principal || "",
          plan_tratamiento: data.plan_tratamiento || "",
          notas_adicionales: data.notas_adicionales || "",
          sintomas_principales: data.sintomas_principales || "",
          antecedentes_relevantes: data.antecedentes_relevantes || ""
        });
        toast.info("Ficha médica existente cargada");
      }
    } catch (error) {
      console.error("Error fetching existing record:", error);
    }
  };

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
    
    if (!formData.motivo_consulta || !formData.diagnostico_principal || !formData.plan_tratamiento) {
      toast.error("Por favor, complete los campos obligatorios");
      return false;
    }
    
    setIsSaving(true);
    
    try {
      // Check if record already exists
      if (recordExists) {
        // Update existing record
        const { error } = await supabase
          .from('fichas_medicas')
          .update({
            motivo_consulta: formData.motivo_consulta,
            diagnostico_principal: formData.diagnostico_principal,
            plan_tratamiento: formData.plan_tratamiento,
            notas_adicionales: formData.notas_adicionales,
            sintomas_principales: formData.sintomas_principales,
            antecedentes_relevantes: formData.antecedentes_relevantes
          })
          .eq('sesion_id', sessionId)
          .eq('paciente_id', patientId);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('fichas_medicas')
          .insert({
            paciente_id: patientId,
            sesion_id: sessionId,
            motivo_consulta: formData.motivo_consulta,
            diagnostico_principal: formData.diagnostico_principal,
            plan_tratamiento: formData.plan_tratamiento,
            notas_adicionales: formData.notas_adicionales || null,
            sintomas_principales: formData.sintomas_principales || null,
            antecedentes_relevantes: formData.antecedentes_relevantes || null
          });
        
        if (error) throw error;
        
        // Set recordExists to true after successful insert
        setRecordExists(true);
      }
      
      // Update the patient's diagnostico in the pacientes table
      await supabase
        .from('pacientes')
        .update({
          diagnostico: formData.diagnostico_principal
        })
        .eq('id', patientId);
      
      return true;
    } catch (error) {
      console.error("Error saving medical record:", error);
      toast.error("Error al guardar la ficha médica");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!patientData || !formData.motivo_consulta) {
      toast.error("No hay datos suficientes para exportar");
      return false;
    }
    
    setIsExporting(true);
    
    try {
      // Make sure to save the record first
      if (!recordExists) {
        const saved = await handleSave();
        if (!saved) {
          toast.error("Error al guardar los datos antes de exportar");
          return false;
        }
      }
      
      // Generate PDF
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246); // Blue color
      doc.text("FICHA MÉDICA", 105, 15, { align: "center" });
      
      // Add today's date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray color
      const today = new Date().toLocaleDateString('es-ES');
      doc.text(`Fecha: ${today}`, 195, 15, { align: "right" });
      
      // Patient information
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Paciente: ${patientData.nombre}`, 14, 25);
      doc.text(`Edad: ${patientData.edad || 'No especificada'}`, 14, 32);
      
      if (patientData.ocupacion) {
        doc.text(`Ocupación: ${patientData.ocupacion}`, 14, 39);
      }
      
      if (patientData.procedencia) {
        doc.text(`Procedencia: ${patientData.procedencia}`, 14, 46);
      }
      
      // Line separator
      doc.setDrawColor(200, 200, 200); // Light gray
      doc.line(14, 50, 196, 50);
      
      // Medical record content
      doc.setFontSize(11);
      
      let yPos = 60;
      
      // Motivo de consulta
      doc.setFont(undefined, 'bold');
      doc.text("Motivo de Consulta:", 14, yPos);
      doc.setFont(undefined, 'normal');
      
      const motivoLines = doc.splitTextToSize(formData.motivo_consulta, 170);
      doc.text(motivoLines, 14, yPos + 7);
      
      yPos += 7 + (motivoLines.length * 7);
      
      // Síntomas principales
      if (formData.sintomas_principales) {
        doc.setFont(undefined, 'bold');
        doc.text("Síntomas Principales:", 14, yPos);
        doc.setFont(undefined, 'normal');
        
        const sintomasLines = doc.splitTextToSize(formData.sintomas_principales, 170);
        doc.text(sintomasLines, 14, yPos + 7);
        
        yPos += 7 + (sintomasLines.length * 7);
      }
      
      // Antecedentes relevantes
      if (formData.antecedentes_relevantes) {
        doc.setFont(undefined, 'bold');
        doc.text("Antecedentes Relevantes:", 14, yPos);
        doc.setFont(undefined, 'normal');
        
        const antecedentesLines = doc.splitTextToSize(formData.antecedentes_relevantes, 170);
        doc.text(antecedentesLines, 14, yPos + 7);
        
        yPos += 7 + (antecedentesLines.length * 7);
      }
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Diagnóstico principal
      doc.setFont(undefined, 'bold');
      doc.text("Diagnóstico Principal:", 14, yPos);
      doc.setFont(undefined, 'normal');
      
      const diagnosticoLines = doc.splitTextToSize(formData.diagnostico_principal, 170);
      doc.text(diagnosticoLines, 14, yPos + 7);
      
      yPos += 7 + (diagnosticoLines.length * 7);
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Plan de tratamiento
      doc.setFont(undefined, 'bold');
      doc.text("Plan de Tratamiento:", 14, yPos);
      doc.setFont(undefined, 'normal');
      
      const planLines = doc.splitTextToSize(formData.plan_tratamiento, 170);
      doc.text(planLines, 14, yPos + 7);
      
      yPos += 7 + (planLines.length * 7);
      
      // Notas adicionales
      if (formData.notas_adicionales) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.text("Notas Adicionales:", 14, yPos);
        doc.setFont(undefined, 'normal');
        
        const notasLines = doc.splitTextToSize(formData.notas_adicionales, 170);
        doc.text(notasLines, 14, yPos + 7);
      }
      
      // Save the PDF
      const fileName = `ficha_medica_${patientData.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      return true;
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Error al exportar el PDF");
      return false;
    } finally {
      setIsExporting(false);
    }
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
    handleExportPDF,
    setFormData,
    recordExists
  };
}
