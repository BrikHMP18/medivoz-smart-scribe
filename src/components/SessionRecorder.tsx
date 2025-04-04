import { Card } from "@/components/ui/card";
import { RecordingControls } from "./session/RecordingControls";
import { useSessionRecorder } from "@/hooks/use-session-recorder";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useEffect } from "react";
import { toast } from "sonner";

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
    handleStopRecording: stopSessionRecording,
    updateSessionWithTranscription
  } = useSessionRecorder({
    patientId,
    isPatientSelected,
    onTranscriptionReady,
    onSessionCreated
  });

  const {
    isRecording: isAudioRecording,
    isPaused: isAudioPaused,
    isTranscribing,
    audioURL,
    audioWaveform,
    permissionDenied,
    requestPermission,
    startRecording: startAudioRecording,
    pauseRecording: pauseAudioRecording,
    resumeRecording: resumeAudioRecording,
    stopRecording: stopAudioRecording,
    transcribeAudio
  } = useAudioRecorder({
    onTranscriptionComplete: (transcription) => {
      console.log("Transcription received in callback:", transcription.substring(0, 100) + "...");
      if (transcription) {
        // Update session with transcription
        updateSessionWithTranscription(transcription);
        
        // Call the parent callback
        onTranscriptionReady(transcription);
      } else {
        toast.error("No se pudo obtener la transcripción");
      }
    }
  });

  // Synchronize session recording with audio recording
  const handleStartRecording = () => {
    startSessionRecording();
    startAudioRecording();
  };

  const handlePauseRecording = () => {
    pauseAudioRecording();
    // We don't pause the session timer
  };

  const handleResumeRecording = () => {
    resumeAudioRecording();
    // We don't need to resume the session timer as it keeps running
  };

  const handleStopRecording = async () => {
    stopAudioRecording();
    stopSessionRecording();
    
    // Transcribe the recorded audio
    console.log("Stopping recording and starting transcription...");
    const transcription = await transcribeAudio();
    console.log("Transcription result:", transcription ? "Received" : "Empty");
    
    // We don't need to call onTranscriptionReady here as it's
    // already being called in the callback in useAudioRecorder
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
          isPaused={isAudioPaused}
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
          onPauseRecording={handlePauseRecording}
          onResumeRecording={handleResumeRecording}
          onStopRecording={handleStopRecording}
        />
      </div>
    </Card>
  );
}
