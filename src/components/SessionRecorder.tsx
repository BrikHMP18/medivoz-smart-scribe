import { memo, useCallback, useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { RecordingControls } from "./session/RecordingControls";
import { AudioFileUpload } from "./session/AudioFileUpload";
import { useSessionRecorder } from "@/hooks/use-session-recorder";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useAudioTranscription } from "@/hooks/use-audio-transcription";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Mic, Radio, Activity, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logger } from "@/utils/logger";
import { uploadAudioToStorage } from "@/utils/audio/storage-utils";
import { useAuth } from "@/contexts/AuthContext";

interface SessionRecorderProps {
  onTranscriptionReady: (transcription: string) => void;
  patientId?: string | null;
  isPatientSelected: boolean;
  onSessionCreated?: (sessionId: string) => void;
}

export const SessionRecorder = memo(function SessionRecorder({ 
  onTranscriptionReady, 
  patientId, 
  isPatientSelected,
  onSessionCreated
}: SessionRecorderProps) {
  const [audioTranscription, setAudioTranscription] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("record");
  const [isUploadTranscribing, setIsUploadTranscribing] = useState(false);
  const isMobile = useIsMobile();
  const audioProcessingRef = useRef(false);
  const { user } = useAuth();
  
  const {
    isRecording: isSessionRecording,
    sessionId,
    dbSessionId,
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
    transcribeAudio,
    getAudioBlob
  } = useAudioRecorder({
    onTranscriptionComplete: (transcription) => {
      logger.log("Transcription received in callback:", transcription ? (transcription.substring(0, 100) + "...") : "Empty");
      if (transcription) {
        setAudioTranscription(transcription);
        
        // Update session with transcription using the database session ID
        updateSessionWithTranscription(transcription, dbSessionId || undefined);
        
        // Call the parent callback
        onTranscriptionReady(transcription);
        audioProcessingRef.current = false;
      } else {
        toast.error("No se pudo obtener la transcripción");
        audioProcessingRef.current = false;
      }
    }
  });

  // Hook for transcribing uploaded files (no callback needed - we handle it in handleFileUpload)
  const { transcribeAudio: transcribeUploadedAudio, isTranscribing: isUploadTranscribingHook } = useAudioTranscription();

  // Update transcription when it changes
  useEffect(() => {
    if (audioTranscription) {
      onTranscriptionReady(audioTranscription);
    }
  }, [audioTranscription, onTranscriptionReady]);

  // Synchronize session recording with audio recording
  const handleStartRecording = useCallback(() => {
    audioProcessingRef.current = false;
    startSessionRecording();
    startAudioRecording();
  }, [startSessionRecording, startAudioRecording]);

  const handlePauseRecording = useCallback(() => {
    if (isAudioRecording && !isAudioPaused) {
      pauseAudioRecording();
    }
  }, [isAudioRecording, isAudioPaused, pauseAudioRecording]);

  const handleResumeRecording = useCallback(() => {
    if (isAudioRecording && isAudioPaused) {
      resumeAudioRecording();
    }
  }, [isAudioRecording, isAudioPaused, resumeAudioRecording]);

  const handleStopRecording = useCallback(async () => {
    // Prevent multiple processing attempts
    if (audioProcessingRef.current) {
      logger.log("Audio is already being processed");
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
      logger.log("Starting transcription...");
      try {
        const transcription = await transcribeAudio();
        logger.log("Transcription result:", transcription ? "Received" : "Empty");

        if (!transcription) {
          audioProcessingRef.current = false;
          toast.error("No se pudo obtener la transcripción. Intente grabar nuevamente.");
        }

        // Upload audio to Supabase Storage
        const audioBlob = getAudioBlob();
        if (audioBlob && dbSessionId && user?.id) {
          uploadAudioToStorage(audioBlob, dbSessionId, user.id).then((path) => {
            if (path) {
              logger.log("Audio saved to storage:", path);
            }
          });
        }
      } catch (error) {
        logger.error("Error during transcription:", error);
        toast.error("Error al transcribir el audio");
        audioProcessingRef.current = false;
      }
    }, 1500); // Increased timeout to ensure audio blob is ready
  }, [isAudioRecording, stopAudioRecording, stopSessionRecording, transcribeAudio, getAudioBlob, dbSessionId, user?.id]);

  // Handle file upload for transcription
  const handleFileUpload = useCallback(async (file: File) => {
    if (!isPatientSelected) {
      toast.error("Primero selecciona un paciente");
      return;
    }

    setIsUploadTranscribing(true);
    toast.info("Procesando archivo de audio...");

    try {
      // Generate session ID if not exists and wait for dbSessionId
      let currentDbSessionId = dbSessionId;
      
      if (!sessionId || !dbSessionId) {
        const result = await generateSessionId();
        if (!result) {
          toast.error("Error al crear la sesión");
          setIsUploadTranscribing(false);
          return;
        }
        currentDbSessionId = result.dbSessionId;
        
        // Wait a bit for React state to update (onSessionCreated sets currentSessionId in parent)
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Convert File to Blob and transcribe
      const audioBlob = new Blob([await file.arrayBuffer()], { type: file.type });
      const transcription = await transcribeUploadedAudio(audioBlob);
      
      // Update session with transcription using the confirmed dbSessionId
      if (transcription && currentDbSessionId) {
        await updateSessionWithTranscription(transcription, currentDbSessionId);
        setAudioTranscription(transcription);
        onTranscriptionReady(transcription);
        toast.success("Transcripción completada exitosamente");

        // Upload audio to Supabase Storage
        if (user?.id) {
          uploadAudioToStorage(audioBlob, currentDbSessionId, user.id).then((path) => {
            if (path) {
              logger.log("Uploaded audio saved to storage:", path);
            }
          });
        }
      } else if (!transcription) {
        toast.error("No se pudo obtener la transcripción del audio");
      }
    } catch (error) {
      logger.error("Error transcribing uploaded file:", error);
      toast.error("Error al transcribir el archivo");
    } finally {
      setIsUploadTranscribing(false);
    }
  }, [isPatientSelected, dbSessionId, sessionId, generateSessionId, transcribeUploadedAudio, updateSessionWithTranscription, onTranscriptionReady]);

  const isActive = isAudioRecording && !isAudioPaused;
  const isProcessing = isTranscribing || audioProcessingRef.current || isUploadTranscribing;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      isActive ? "border-primary shadow-lg shadow-primary/10" : "hover:shadow-md"
    )}>
      {isActive && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
      )}
      
      <div className="relative z-10 p-6 flex flex-col items-center gap-4">
        <div className="w-full flex items-center justify-between border-b pb-4">
           <div className="flex items-center gap-2.5">
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                isActive ? "bg-red-100 text-red-600 animate-pulse" : "bg-primary/10 text-primary"
              )}>
                {isActive ? <Radio className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </div>
              <div>
                 <h3 className="font-semibold text-lg leading-none">Grabadora</h3>
                 <p className="text-xs text-muted-foreground mt-1">Captura de audio de consulta</p>
              </div>
           </div>
           
           {sessionId ? (
              <Badge variant="outline" className={cn(
                "font-mono text-xs transition-colors",
                isActive ? "border-red-200 bg-red-50 text-red-700" : "bg-background"
              )}>
                {isActive && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500 animate-ping inline-block"/>}
                ID: {sessionId.substring(0,8)}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs text-muted-foreground bg-muted">
                Esperando inicio
              </Badge>
            )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1.5 rounded-lg">
            <TabsTrigger 
              value="record" 
              disabled={isProcessing || isAudioRecording}
              className="text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
            >
              <Mic className="h-4 w-4 mr-2" />
              Grabar
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              disabled={isProcessing || isAudioRecording}
              className="text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Audio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="mt-0">
            <div className="w-full py-2">
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
          </TabsContent>

          <TabsContent value="upload" className="mt-0">
            <div className="w-full py-2">
              <AudioFileUpload
                onFileSelected={handleFileUpload}
                isProcessing={isUploadTranscribing}
                isDisabled={!isPatientSelected}
              />
              {!isPatientSelected && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Selecciona un paciente para poder subir audio
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {isActive && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
             <Activity className="h-3 w-3 text-primary" />
             <span>Grabando audio de alta calidad...</span>
          </div>
        )}
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Only re-render if critical props have changed
  return (
    prevProps.patientId === nextProps.patientId &&
    prevProps.isPatientSelected === nextProps.isPatientSelected
    // Note: Callbacks (onTranscriptionReady, onSessionCreated) should be memoized
    // with useCallback in parent component
  );
});
