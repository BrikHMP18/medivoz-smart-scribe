
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
  const audioBlobRef = useRef<Blob | null>(null);

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
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
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
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      setupAudioContext(stream);
      
      // Determine supported MIME types
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
      
      let mimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      if (!mimeType) {
        console.warn("No supported MIME types found, using default");
        mimeType = '';  // Let browser choose default
      }
      
      console.log("Using MIME type:", mimeType);
      
      // Create the MediaRecorder with the determined MIME type
      mediaRecorderRef.current = mimeType ? 
        new MediaRecorder(stream, { mimeType }) : 
        new MediaRecorder(stream);
        
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        // Create blob with all chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        audioBlobRef.current = audioBlob;
        
        // Revoke previous URL if it exists
        if (audioURL) {
          URL.revokeObjectURL(audioURL);
        }
        
        // Create new URL
        const url = URL.createObjectURL(audioBlob);
        console.log("Created audio URL:", url);
        setAudioURL(url);
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
    if (!audioBlobRef.current) {
      console.error("No audio blob available for transcription");
      toast.error("No hay audio para transcribir");
      return "";
    }
    
    setIsTranscribing(true);
    
    try {
      // Convert Blob to base64
      console.log("Starting base64 conversion for blob size:", audioBlobRef.current.size);
      const base64Audio = await blobToBase64(audioBlobRef.current);
      
      if (!base64Audio) {
        throw new Error("Failed to convert audio to base64");
      }
      
      console.log("Audio converted to base64, length:", base64Audio.length);
      
      // Call our edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });
      
      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      // Handle the transcription result
      console.log("Transcription data received:", data ? "yes" : "no");
      
      // Extract the transcription from the response
      const transcription = data?.formattedTranscription || data?.rawTranscription?.text || "";
      console.log("Final transcription length:", transcription.length);
      
      if (options?.onTranscriptionComplete && transcription) {
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
  
  // Helper function to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error("FileReader result is not a string"));
        }
      };
      reader.onerror = () => {
        reject(new Error("FileReader error: " + reader.error));
      };
      reader.readAsDataURL(blob);
    });
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
