
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseSessionRecorderProps {
  patientId?: string | null;
  isPatientSelected: boolean;
  onTranscriptionReady: (transcription: string) => void;
  onSessionCreated?: (sessionId: string) => void;
}

interface SessionData {
  id: string;
  codigo_sesion: string;
  paciente_id: string;
}

export function useSessionRecorder({
  patientId,
  isPatientSelected,
  onTranscriptionReady,
  onSessionCreated
}: UseSessionRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerId, setTimerId] = useState<number | null>(null);

  const generateSessionId = () => {
    if (!patientId) {
      toast.error("Debe seleccionar un paciente primero");
      return null;
    }
    
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionId(randomId);
    
    // Create session in Supabase
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        toast.error("Usuario no autenticado");
        setSessionId("");
        return;
      }
      
      supabase.from('sesiones').insert({
        codigo_sesion: randomId,
        paciente_id: patientId,
        doctor_id: user.id,
      }).select('id, codigo_sesion, paciente_id').then(({ data, error }) => {
      if (error) {
        console.error("Error creating session:", error);
        toast.error("Error al crear la sesión");
        setSessionId("");
        return null;
      }
      
      toast.success(`Sesión ${randomId} creada correctamente`);
      
      // If onSessionCreated callback is provided, call it with the session ID
      if (onSessionCreated && data && data.length > 0) {
        const createdSession = data[0] as SessionData;
        if (createdSession && createdSession.id) {
          onSessionCreated(createdSession.id);
        }
      }
      });
    });
    
    return randomId;
  };

  const handleStartRecording = () => {
    if (!isPatientSelected) {
      toast.error("Debe seleccionar un paciente primero");
      return;
    }
    
    if (!sessionId) {
      const newSessionId = generateSessionId();
      if (!newSessionId) return;
    }
    
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
    const id = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    setTimerId(id);
    
    toast.success("Grabación iniciada");
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    
    // Clear timer
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    
    toast.success("Grabación detenida");
  };

  // Update session with transcription
  const updateSessionWithTranscription = async (transcription: string) => {
    if (sessionId && patientId) {
      try {
        const { error } = await supabase.from('sesiones').update({
          transcripcion: transcription,
        }).eq('codigo_sesion', sessionId);
        
        if (error) {
          console.error("Error updating session with transcription:", error);
          toast.error("Error al guardar la transcripción");
          return;
        }
        
        // Update patient's last visit date
        await supabase.from('pacientes').update({
          ultima_visita: new Date().toISOString(),
        }).eq('id', patientId);
        
        toast.success("Transcripción guardada correctamente");
        
      } catch (error) {
        console.error("Error in updateSessionWithTranscription:", error);
      }
    }
  };

  return {
    isRecording,
    sessionId,
    recordingTime,
    generateSessionId,
    handleStartRecording,
    handleStopRecording,
    updateSessionWithTranscription
  };
}
