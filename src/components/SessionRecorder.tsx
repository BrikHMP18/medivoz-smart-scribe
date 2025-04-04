
import { Card } from "@/components/ui/card";
import { RecordingControls } from "./session/RecordingControls";
import { useSessionRecorder } from "@/hooks/use-session-recorder";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useEffect } from "react";

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
    isRecording: isSessionRecording,
    sessionId,
    recordingTime,
    generateSessionId,
    handleStartRecording: startSessionRecording,
    handleStopRecording: stopSessionRecording
  } = useSessionRecorder({
    patientId,
    isPatientSelected,
    onTranscriptionReady,
    onSessionCreated
  });

  const {
    isRecording: isAudioRecording,
    isTranscribing,
    audioURL,
    audioWaveform,
    permissionDenied,
    requestPermission,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    transcribeAudio
  } = useAudioRecorder({
    onTranscriptionComplete: onTranscriptionReady
  });

  // Synchronize session recording with audio recording
  const handleStartRecording = () => {
    startSessionRecording();
    startAudioRecording();
  };

  const handleStopRecording = async () => {
    stopAudioRecording();
    stopSessionRecording();
    
    // Transcribe the recorded audio
    const transcription = await transcribeAudio();
    
    // We don't need to call onTranscriptionReady here as it's
    // already being called in useAudioRecorder
  };

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
          isRecording={isAudioRecording}
          isPatientSelected={isPatientSelected}
          isTranscribing={isTranscribing}
          audioURL={audioURL}
          audioWaveform={audioWaveform}
          sessionId={sessionId}
          recordingTime={recordingTime}
          permissionDenied={permissionDenied}
          onRequestPermission={requestPermission}
          onGenerateSessionId={generateSessionId}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
      </div>
    </Card>
  );
}
