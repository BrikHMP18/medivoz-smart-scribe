
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SessionRecorder } from "@/components/SessionRecorder";
import { Transcription } from "@/components/Transcription";
import { useIsMobile } from "@/hooks/use-mobile";
import { PatientSearch } from "@/components/PatientSearch";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User } from "lucide-react";

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
        toast.success(`Paciente ${data.nombre} cargado correctamente`);
      }
    } catch (error) {
      console.error("Error loading patient:", error);
      toast.error("Error al cargar el paciente");
    }
  };

  const handleSessionCreated = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    toast.success(`Sesión ${sessionId} iniciada correctamente`);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-64">
        <div className="container mx-auto py-6 px-4 md:px-6">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-medivoz-400 to-medivoz-600 text-transparent bg-clip-text">
              Sesión de Consulta
            </h1>
            <p className="text-muted-foreground">
              Seleccione un paciente y grabe la consulta médica
            </p>
          </header>
          
          <div className="mb-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Paciente para esta sesión
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {selectedPatient ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedPatient.nombre}</p>
                      <p className="text-sm text-muted-foreground">DNI: {selectedPatient.dni}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedPatient(null)}
                      className="text-sm text-primary hover:underline"
                    >
                      Cambiar paciente
                    </button>
                  </div>
                ) : (
                  <PatientSearch 
                    onPatientSelect={setSelectedPatient} 
                    selectedPatient={selectedPatient} 
                  />
                )}
              </CardContent>
            </Card>
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
