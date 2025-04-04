
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SessionRecorder } from "@/components/SessionRecorder";
import { Transcription } from "@/components/Transcription";
import { useIsMobile } from "@/hooks/use-mobile";
import { PatientSearch } from "@/components/PatientSearch";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Patient {
  id: string;
  nombre: string;
  dni: string;
  edad: number | null;
  diagnostico: string | null;
}

export default function Session() {
  const [transcription, setTranscription] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Check if patientId is provided in the URL
  useEffect(() => {
    const patientId = searchParams.get('patientId');
    if (patientId) {
      loadPatient(patientId);
    }
  }, [searchParams]);
  
  // Load patient data if ID is provided
  const loadPatient = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nombre, dni, edad, diagnostico')
        .eq('id', patientId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSelectedPatient(data);
      }
    } catch (error) {
      console.error("Error loading patient:", error);
      toast.error("Error al cargar el paciente");
    }
  };

  const handleSessionCreated = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-64">
        <div className="container mx-auto py-6 px-4 md:px-6">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Sesión de Consulta</h1>
            <p className="text-muted-foreground">
              Seleccione un paciente y grabe la consulta médica
            </p>
          </header>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Paciente para esta sesión</h2>
            <PatientSearch 
              onPatientSelect={setSelectedPatient} 
              selectedPatient={selectedPatient} 
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <SessionRecorder 
              onTranscriptionReady={setTranscription} 
              patientId={selectedPatient?.id || null}
              isPatientSelected={!!selectedPatient}
              onSessionCreated={handleSessionCreated}
            />
          </div>
          
          <div className="min-h-[300px] md:min-h-[500px] mb-6">
            <Transcription 
              transcription={transcription}
              patientId={selectedPatient?.id}
              sessionId={currentSessionId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
