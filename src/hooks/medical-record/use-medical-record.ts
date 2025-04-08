
import { useState, useEffect, useCallback } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
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

  const loadTranscription = useCallback(async () => {
    if (!sessionId) return "";
    
    console.log("Fetching transcription data for session:", sessionId);
    try {
      const transcription = await fetchTranscriptionData(sessionId);
      if (transcription) {
        console.log("Transcription loaded, length:", transcription.length);
        setFullTranscription(transcription);
        
        // Get the first 200 characters as snippet
        const snippet = transcription.substring(0, 200) + (transcription.length > 200 ? '...' : '');
        setTranscriptionSnippet(snippet);
        return transcription;
      } else {
        console.warn("No transcription found for session:", sessionId);
        return "";
      }
    } catch (error) {
      console.error("Error loading transcription:", error);
      return "";
    }
  }, [sessionId]);

  const loadRecordData = useCallback(async () => {
    if (!sessionId || !patientId) return;
    
    console.log("Checking if record exists for session:", sessionId, "and patient:", patientId);
    try {
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
    } catch (error) {
      console.error("Error checking record existence:", error);
    }
  }, [sessionId, patientId]);

  const loadPatientData = useCallback(async () => {
    if (!patientId) return;
    
    console.log("Loading patient data for patient:", patientId);
    try {
      const data = await fetchPatientData(patientId);
      if (data) {
        console.log("Patient data loaded:", data);
        setPatientData(data);
      }
    } catch (error) {
      console.error("Error loading patient data:", error);
    }
  }, [patientId]);

  // Initial load of data when component mounts or ids change
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
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
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllData();
  }, [sessionId, patientId, loadTranscription, loadPatientData, loadRecordData]);

  const refreshTranscription = useCallback(async () => {
    const transcription = await loadTranscription();
    return transcription;
  }, [loadTranscription]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTranscriptionView = () => {
    setShowFullTranscription(prev => !prev);
  };

  const handleSave = async () => {
    try {
      return await saveMedicalRecord(formData, patientId || "", sessionId || "", recordExists, setIsSaving);
    } catch (error) {
      console.error("Error saving medical record:", error);
      return false;
    }
  };

  const handleExportPDF = async () => {
    try {
      return await exportMedicalRecordPDF(patientData, formData, setIsExporting);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      return false;
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
    isLoading,
    handleChange,
    toggleTranscriptionView,
    handleSave,
    handleExportPDF,
    setFormData,
    recordExists,
    refreshTranscription
  };
}

// Re-export the types from API file for convenience
export type { MedicalRecordFormData, PatientData } from "./use-medical-record-api";
