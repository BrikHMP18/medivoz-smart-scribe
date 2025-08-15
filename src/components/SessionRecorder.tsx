
import { Card } from "@/components/ui/card";
import { RecordingControls } from "./session/RecordingControls";
import { useSessionRecorder } from "@/hooks/use-session-recorder";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Mic } from "lucide-react";

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
  const [audioTranscription, setAudioTranscription] = useState<string>("");
  const isMobile = useIsMobile();
  const audioProcessingRef = useRef(false);
  
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
      console.log("Transcription received in callback:", transcription ? (transcription.substring(0, 100) + "...") : "Empty");
      if (transcription) {
        setAudioTranscription(transcription);
        
        // Update session with transcription
        updateSessionWithTranscription(transcription);
        
        // Call the parent callback
        onTranscriptionReady(transcription);
        audioProcessingRef.current = false;
      } else {
        toast.error("No se pudo obtener la transcripción");
        audioProcessingRef.current = false;
      }
    }
  });

  // Update transcription when it changes
  useEffect(() => {
    if (audioTranscription) {
      onTranscriptionReady(audioTranscription);
    }
  }, [audioTranscription, onTranscriptionReady]);

  // Synchronize session recording with audio recording
  const handleStartRecording = () => {
    audioProcessingRef.current = false;
    startSessionRecording();
    startAudioRecording();
  };

  const handlePauseRecording = () => {
    if (isAudioRecording && !isAudioPaused) {
      pauseAudioRecording();
    }
  };

  const handleResumeRecording = () => {
    if (isAudioRecording && isAudioPaused) {
      resumeAudioRecording();
    }
  };

  const handleStopRecording = async () => {
    // Prevent multiple processing attempts
    if (audioProcessingRef.current) {
      console.log("Audio is already being processed");
      return;
    }
    
    audioProcessingRef.current = true;
    
    // First stop the audio recording - this will create the blob
    if (isAudioRecording) {
      await stopAudioRecording();
    }
    
    // Then stop the session recording
    stopSessionRecording();
    
    // Wait a moment for the blob to be created before transcribing
    setTimeout(async () => {
      // Transcribe the recorded audio
      console.log("Starting transcription...");
      try {
        const transcription = await transcribeAudio();
        console.log("Transcription result:", transcription ? "Received" : "Empty");
        
        if (!transcription) {
          audioProcessingRef.current = false;
          toast.error("No se pudo obtener la transcripción. Intente grabar nuevamente.");
        }
      } catch (error) {
        console.error("Error during transcription:", error);
        toast.error("Error al transcribir el audio");
        audioProcessingRef.current = false;
      }
    }, 1500); // Increased timeout to ensure audio blob is ready
  };

  return (
    <Card className={`p-4 md:p-6 relative overflow-hidden ${isMobile ? 'w-full' : ''} border-t-4 border-t-primary transition-all hover:shadow-md`}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary opacity-75"></div>
      
      <div className="flex flex-col items-center gap-4 md:gap-6">
        <div className="text-center">
          <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center justify-center gap-2 text-foreground">
            <Mic className="h-5 w-5 text-primary" />
            <span>Grabación de Sesión</span>
          </h3>
          <p className="text-muted-foreground text-sm md:text-base">
            {sessionId ? (
              <span className="animate-pulse inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs border border-primary/20">
                Sesión activa: {sessionId}
              </span>
            ) : (
              "Sin sesión activa"
            )}
          </p>
        </div>
        
        <RecordingControls
          isRecording={isAudioRecording}
          isPaused={isAudioPaused}
          isPatientSelected={isPatientSelected}
          isTranscribing={isTranscribing || audioProcessingRef.current}
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
