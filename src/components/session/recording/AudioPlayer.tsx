
import { useState, useRef, useEffect } from "react";
import { Volume2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface AudioPlayerProps {
  audioURL: string | null;
  isVisible: boolean;
}

export function AudioPlayer({ audioURL, isVisible }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startProgressTracking = (audio: HTMLAudioElement) => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = window.setInterval(() => {
      if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(progress);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Handle audio playback
  const handlePlayAudio = () => {
    if (!audioURL || hasError) return;
    
    if (!audioElementRef.current) {
      const audio = new Audio(audioURL);
      
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
      };
      
      audio.onplay = () => {
        setIsPlaying(true);
        startProgressTracking(audio);
      };
      
      audio.onpause = () => {
        setIsPlaying(false);
        stopProgressTracking();
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setAudioProgress(100);
        stopProgressTracking();
      };
      
      audio.onerror = () => {
        console.error("Audio error loading from URL:", audioURL);
        setHasError(true);
        toast.error("Error al cargar el audio");
      };
      
      audioElementRef.current = audio;
      
      // Preload the audio before attempting to play
      audio.load();
      
      // Add a small delay before playing to ensure the audio is loaded
      setTimeout(() => {
        audio.play().catch(err => {
          console.error("Error playing audio:", err);
          setHasError(true);
          toast.error("No se pudo reproducir el audio");
        });
      }, 300);
    } else {
      if (isPlaying) {
        audioElementRef.current.pause();
      } else {
        audioElementRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          setHasError(true);
          toast.error("No se pudo reproducir el audio");
        });
      }
    }
  };

  // Reset audio player when audio URL changes
  useEffect(() => {
    setHasError(false);
    setAudioProgress(0);
    
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      stopProgressTracking();
      audioElementRef.current = null;
    }
    
    if (audioURL) {
      console.log("New audio URL:", audioURL);
      const audio = new Audio();
      
      audio.onloadedmetadata = () => {
        console.log("Audio metadata loaded, duration:", audio.duration);
        setAudioDuration(audio.duration || 0);
      };
      
      audio.onerror = (e) => {
        console.error("Error loading audio:", e);
        setHasError(true);
        toast.error("Error al cargar el audio. Por favor, intente grabar nuevamente.");
      };
      
      audio.src = audioURL;
      audioElementRef.current = audio;
      audio.load();
    }
    
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      stopProgressTracking();
    };
  }, [audioURL]);

  // Clean up audio element and interval on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      stopProgressTracking();
    };
  }, []);

  if (!isVisible || !audioURL) {
    return null;
  }

  return (
    <div className="w-full">
      {hasError ? (
        <div className="flex items-center justify-center p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-sm text-red-600">Error al cargar el audio. Por favor, intente grabar nuevamente.</span>
        </div>
      ) : (
        <>
          <Button
            variant="secondary"
            size="lg"
            onClick={handlePlayAudio}
            className="mb-4 w-full sm:w-auto"
            disabled={hasError}
          >
            <Volume2 className="mr-2 h-5 w-5" />
            {isPlaying ? "Pausar Audio" : "Reproducir Audio"}
          </Button>
          
          <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
            <span>{formatTime(audioDuration * (audioProgress / 100))}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
          <Progress value={audioProgress} className="h-2" />
        </>
      )}
    </div>
  );
}
