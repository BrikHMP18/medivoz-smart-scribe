import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAudioWaveform } from "./use-audio-waveform";
import { useAudioTranscription } from "./use-audio-transcription";
import { 
  getBestSupportedMimeType, 
  validateAudioBlob, 
  createBlobURL, 
  revokeBlobURL 
} from "@/utils/audio";

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

  const requestPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setupAnalyser(stream);
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

  const createAudioBlob = (): Blob | null => {
    if (audioChunksRef.current.length === 0) {
      console.error("No audio chunks available");
      return null;
    }

    if (audioBlobRef.current) {
      return audioBlobRef.current;
    }

    try {
      const type = mimeTypeRef.current || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type });
      console.log(`Created audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
      
      if (validateAudioBlob(audioBlob)) {
        audioBlobRef.current = audioBlob;
        return audioBlob;
      }
    } catch (error) {
      console.error("Error creating audio blob:", error);
    }
    
    return null;
  };

  const updateAudioURL = (blob: Blob | null): void => {
    revokeBlobURL(audioURL);
    
    if (!blob) {
      setAudioURL(null);
      return;
    }
    
    const url = createBlobURL(blob);
    setAudioURL(url);
  };

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
      
      audioChunksRef.current = [];
      audioBlobRef.current = null;
      revokeBlobURL(audioURL);
      setAudioURL(null);
      
      mimeTypeRef.current = getBestSupportedMimeType();
      
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
        const audioBlob = createAudioBlob();
        updateAudioURL(audioBlob);
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setIsPaused(false);
      startWaveformAnimation();
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Error al iniciar la grabación");
    }
  };

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

  const stopRecording = async () => {
    console.log("Attempting to stop recording. State:", mediaRecorderRef.current?.state);
    
    if (!isRecording || !mediaRecorderRef.current) {
      console.log("Cannot stop - not recording or no media recorder");
      return;
    }
    
    try {
      mediaRecorderRef.current.requestData();
      
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        console.log("Recording stopped successfully");
      }
      
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

      if (!audioBlobRef.current) {
        const audioBlob = createAudioBlob();
        updateAudioURL(audioBlob);
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      toast.error("Error al detener la grabación");
    }
  };

  const transcribeAudio = async (): Promise<string> => {
    const audioBlob = audioBlobRef.current || createAudioBlob();
    
    if (!audioBlob) {
      console.error("No audio blob available for transcription");
      toast.error("No hay audio para transcribir");
      return "";
    }
    
    if (!audioURL) {
      updateAudioURL(audioBlob);
    }
    
    return await transcribe(audioBlob);
  };

  const getAudioBlob = (): Blob | null => {
    return audioBlobRef.current || createAudioBlob();
  };

  useEffect(() => {
    return () => {
      revokeBlobURL(audioURL);
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
    transcribeAudio,
    getAudioBlob
  };
}
