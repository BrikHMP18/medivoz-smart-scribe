
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAudioWaveform } from "./use-audio-waveform";
import { useAudioTranscription } from "./use-audio-transcription";
import { getBestSupportedMimeType, validateAudioBlob } from "@/utils/audio-utils";

interface AudioRecorderOptions {
  onTranscriptionComplete?: (transcription: string) => void;
}

export function useAudioRecorder(options?: AudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const mimeTypeRef = useRef<string>('');

  // Use our custom hooks
  const { 
    audioWaveform,
    setupAnalyser,
    startWaveformAnimation,
    stopWaveformAnimation 
  } = useAudioWaveform();
  
  const { 
    isTranscribing, 
    transcribeAudio: transcribe 
  } = useAudioTranscription({
    onTranscriptionComplete: options?.onTranscriptionComplete
  });

  // Request microphone permission
  const requestPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setupAnalyser(stream);
      // Close this stream as we're just checking permissions
      stream.getTracks().forEach(track => track.stop());
      setPermissionDenied(false);
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      setPermissionDenied(true);
      toast.error("No se pudo acceder al micrófono. Por favor, conceda permiso para continuar.");
      return false;
    }
  };

  // Start recording from microphone
  const startRecording = async () => {
    if (isRecording) return;
    
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      setupAnalyser(stream);
      
      // Reset audio chunks and blob
      audioChunksRef.current = [];
      audioBlobRef.current = null;
      
      // Determine supported MIME type
      mimeTypeRef.current = getBestSupportedMimeType();
      
      // Create the MediaRecorder with the determined MIME type
      mediaRecorderRef.current = mimeTypeRef.current ? 
        new MediaRecorder(stream, { mimeType: mimeTypeRef.current }) : 
        new MediaRecorder(stream);
        
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`Audio chunk received: ${event.data.size} bytes, type: ${event.data.type}`);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        // Create blob with all chunks
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mimeTypeRef.current || 'audio/webm' 
        });
        
        console.log(`Audio recording stopped, creating blob of size: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
        
        // Validate the blob
        if (validateAudioBlob(audioBlob)) {
          // Store the blob for later use
          audioBlobRef.current = audioBlob;
          
          // Revoke previous URL if it exists
          if (audioURL) {
            URL.revokeObjectURL(audioURL);
          }
          
          // Create new URL
          const url = URL.createObjectURL(audioBlob);
          console.log("Created audio URL:", url);
          setAudioURL(url);
        } else {
          toast.error("Error al crear el audio. Por favor, intente grabar nuevamente.");
        }
      };
      
      mediaRecorderRef.current.start(100); // Collect data more frequently
      setIsRecording(true);
      setIsPaused(false);
      startWaveformAnimation();
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Error al iniciar la grabación");
    }
  };

  // Pause recording
  const pauseRecording = () => {
    console.log("Attempting to pause recording. State:", mediaRecorderRef.current?.state);
    
    if (!isRecording || !mediaRecorderRef.current) {
      console.log("Cannot pause - not recording or no media recorder");
      return;
    }
    
    try {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        stopWaveformAnimation();
        console.log("Recording paused successfully");
      } else {
        console.log("Cannot pause - current state:", mediaRecorderRef.current.state);
      }
    } catch (error) {
      console.error("Error pausing recording:", error);
      toast.error("Error al pausar la grabación");
    }
  };

  // Resume recording
  const resumeRecording = () => {
    console.log("Attempting to resume recording. State:", mediaRecorderRef.current?.state);
    
    if (!isRecording || !mediaRecorderRef.current || !isPaused) {
      console.log("Cannot resume - not recording, no media recorder, or not paused");
      return;
    }
    
    try {
      if (mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        startWaveformAnimation();
        console.log("Recording resumed successfully");
      } else {
        console.log("Cannot resume - current state:", mediaRecorderRef.current.state);
      }
    } catch (error) {
      console.error("Error resuming recording:", error);
      toast.error("Error al reanudar la grabación");
    }
  };

  // Stop recording
  const stopRecording = () => {
    console.log("Attempting to stop recording. State:", mediaRecorderRef.current?.state);
    
    if (!isRecording || !mediaRecorderRef.current) {
      console.log("Cannot stop - not recording or no media recorder");
      return;
    }
    
    try {
      // Request a final chunk of data
      mediaRecorderRef.current.requestData();
      
      // Only call stop() if we're recording or paused
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        console.log("Recording stopped successfully");
      }
      
      // Stop all tracks to turn off microphone
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log("Track stopped:", track.kind);
        });
        streamRef.current = null;
      }
      
      setIsRecording(false);
      setIsPaused(false);
      stopWaveformAnimation();
    } catch (error) {
      console.error("Error stopping recording:", error);
      toast.error("Error al detener la grabación");
    }
  };

  // Transcribe audio using the hook
  const transcribeAudio = async (): Promise<string> => {
    if (!audioBlobRef.current) {
      console.error("No audio blob available for transcription");
      
      // Check if we have audio chunks but no blob
      if (audioChunksRef.current.length > 0) {
        // Try to create the blob from chunks
        console.log("Attempting to create blob from chunks");
        try {
          audioBlobRef.current = new Blob(audioChunksRef.current, { 
            type: mimeTypeRef.current || 'audio/webm' 
          });
          console.log("Created blob from chunks, size:", audioBlobRef.current.size);
          
          if (!validateAudioBlob(audioBlobRef.current)) {
            toast.error("El audio grabado no es válido");
            return "";
          }
        } catch (error) {
          console.error("Failed to create blob from chunks:", error);
          toast.error("Error al procesar el audio grabado");
          return "";
        }
      } else {
        toast.error("No hay audio para transcribir");
        return "";
      }
    }
    
    return await transcribe(audioBlobRef.current);
  };

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      stopWaveformAnimation();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    isRecording,
    isPaused,
    isTranscribing,
    audioURL,
    audioWaveform,
    permissionDenied,
    requestPermission,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    transcribeAudio
  };
}
