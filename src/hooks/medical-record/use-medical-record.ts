
import { useState, useEffect } from "react";
import { exportMedicalRecordPDF } from "./use-medical-record-pdf";
import {
  fetchTranscriptionData,
  checkRecordExists,
  fetchExistingRecord,
  fetchPatientData,
  saveMedicalRecord,
  MedicalRecordFormData,
  PatientData
} from "./use-medical-record-api";

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

  // Effect to load all necessary data when sessionId or patientId changes
  useEffect(() => {
    const loadAllData = async () => {
      if (sessionId) {
        console.log("Loading transcription for session:", sessionId);
        await loadTranscription();
      }
      
      if (patientId) {
        console.log("Loading patient data for patient:", patientId);
        await loadPatientData();
      }
      
      if (sessionId && patientId) {
        console.log("Loading record data for session:", sessionId, "and patient:", patientId);
        await loadRecordData();
      }
    };
    
    loadAllData();
  }, [sessionId, patientId]);

  const loadTranscription = async () => {
    if (!sessionId) return;
    
    console.log("Fetching transcription data for session:", sessionId);
    const transcription = await fetchTranscriptionData(sessionId);
    if (transcription) {
      console.log("Transcription loaded, length:", transcription.length);
      setFullTranscription(transcription);
      
      // Get the first 200 characters as snippet
      const snippet = transcription.substring(0, 200) + (transcription.length > 200 ? '...' : '');
      setTranscriptionSnippet(snippet);
    } else {
      console.warn("No transcription found for session:", sessionId);
    }
  };

  const loadRecordData = async () => {
    if (!sessionId || !patientId) return;
    
    console.log("Checking if record exists for session:", sessionId, "and patient:", patientId);
    const exists = await checkRecordExists(sessionId, patientId);
    setRecordExists(exists);
    
    if (exists) {
      console.log("Record exists, loading data");
      const recordData = await fetchExistingRecord(sessionId, patientId);
      if (recordData) {
        console.log("Record data loaded:", recordData);
        setFormData(recordData);
      }
    } else {
      console.log("No existing record found, will create new when saved");
    }
  };

  const loadPatientData = async () => {
    if (!patientId) return;
    
    console.log("Loading patient data for patient:", patientId);
    const data = await fetchPatientData(patientId);
    if (data) {
      console.log("Patient data loaded:", data);
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

// Re-export the types from API file for convenience
export type { MedicalRecordFormData, PatientData } from "./use-medical-record-api";
