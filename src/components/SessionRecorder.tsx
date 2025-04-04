
import { Card } from "@/components/ui/card";
import { RecordingControls } from "./session/RecordingControls";
import { useSessionRecorder } from "@/hooks/use-session-recorder";

interface SessionRecorderProps {
  onTranscriptionReady: (transcription: string) => void;
  patientId?: string | null;
  isPatientSelected: boolean;
  onSessionCreated?: (sessionId: string) => void;
}

export function SessionRecorder({ 
  onTranscriptionReady, 
  patientId, 
  isPatientSelected,
  onSessionCreated
}: SessionRecorderProps) {
  const {
    isRecording,
    sessionId,
    recordingTime,
    generateSessionId,
    handleStartRecording,
    handleStopRecording
  } = useSessionRecorder({
    patientId,
    isPatientSelected,
    onTranscriptionReady,
    onSessionCreated
  });

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-medivoz-400 to-medivoz-600"></div>
      
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Grabación de Sesión</h3>
          <p className="text-muted-foreground">
            {sessionId ? `Sesión activa: ${sessionId}` : "Sin sesión activa"}
          </p>
        </div>
        
        <RecordingControls
          isRecording={isRecording}
          isPatientSelected={isPatientSelected}
          sessionId={sessionId}
          recordingTime={recordingTime}
          onGenerateSessionId={generateSessionId}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
      </div>
    </Card>
  );
}
