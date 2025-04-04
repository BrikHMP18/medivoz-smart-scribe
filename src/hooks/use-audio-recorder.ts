
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AudioRecorderOptions {
  onTranscriptionComplete?: (transcription: string) => void;
}

export function useAudioRecorder(options?: AudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [audioWaveform, setAudioWaveform] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Request microphone permission
  const requestPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setupAudioContext(stream);
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

  // Set up audio context for waveform visualization
  const setupAudioContext = (stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
  };

  // Start recording from microphone
  const startRecording = async () => {
    if (isRecording) return;
    
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setupAudioContext(stream);
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };
      
      mediaRecorderRef.current.start();
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
    if (!isRecording || !mediaRecorderRef.current || isPaused) return;
    
    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopWaveformAnimation();
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (!isRecording || !mediaRecorderRef.current || !isPaused) return;
    
    if (mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startWaveformAnimation();
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.stop();
    // Stop all tracks to turn off microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
    stopWaveformAnimation();
  };

  // Handle waveform animation
  const startWaveformAnimation = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateWaveform = () => {
      if (!isRecording || !analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Sample some points from the frequency data for the waveform
      const sampleSize = 40; // Number of points to show in waveform
      const sampledData = [];
      
      for (let i = 0; i < sampleSize; i++) {
        const index = Math.floor(i * (bufferLength / sampleSize));
        sampledData.push(dataArray[index]);
      }
      
      setAudioWaveform(sampledData);
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    };
    
    updateWaveform();
  };

  // Stop animation frame
  const stopWaveformAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Transcribe the recorded audio
  const transcribeAudio = async (): Promise<string> => {
    if (!audioURL) {
      toast.error("No hay audio para transcribir");
      return "";
    }
    
    setIsTranscribing(true);
    
    try {
      // Convert Blob URL to base64
      const response = await fetch(audioURL);
      const blob = await response.blob();
      
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remove data URL prefix
          resolve(base64Data);
        };
        reader.readAsDataURL(blob);
      });
      
      // Call our edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const transcription = data.formattedTranscription || data.rawTranscription?.text || "";
      
      if (options?.onTranscriptionComplete) {
        options.onTranscriptionComplete(transcription);
      }
      
      return transcription;
      
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Error al transcribir el audio');
      return "";
    } finally {
      setIsTranscribing(false);
    }
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
  }, [audioURL, isRecording]);

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
