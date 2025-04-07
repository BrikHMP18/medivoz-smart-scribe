
import { useState, useEffect } from "react";
import { exportMedicalRecordPDF } from "./use-medical-record-pdf";
import {
  fetchTranscriptionData,
  checkRecordExists,
  fetchExistingRecord,
  fetchPatientData,
  saveMedicalRecord
} from "./use-medical-record-api";

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
      loadTranscription();
      if (patientId) {
        loadRecordData();
      }
    }
    
    if (patientId) {
      loadPatientData();
    }
  }, [sessionId, patientId]);

  const loadTranscription = async () => {
    if (!sessionId) return;
    
    const transcription = await fetchTranscriptionData(sessionId);
    if (transcription) {
      setFullTranscription(transcription);
      
      // Get the first 200 characters as snippet
      const snippet = transcription.substring(0, 200) + (transcription.length > 200 ? '...' : '');
      setTranscriptionSnippet(snippet);
    }
  };

  const loadRecordData = async () => {
    if (!sessionId || !patientId) return;
    
    const exists = await checkRecordExists(sessionId, patientId);
    setRecordExists(exists);
    
    if (exists) {
      const recordData = await fetchExistingRecord(sessionId, patientId);
      if (recordData) {
        setFormData(recordData);
      }
    }
  };

  const loadPatientData = async () => {
    if (!patientId) return;
    
    const data = await fetchPatientData(patientId);
    if (data) {
      setPatientData(data);
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
    return await saveMedicalRecord(formData, patientId || "", sessionId || "", recordExists, setIsSaving);
  };

  const handleExportPDF = async () => {
    return await exportMedicalRecordPDF(patientData, formData, setIsExporting);
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
