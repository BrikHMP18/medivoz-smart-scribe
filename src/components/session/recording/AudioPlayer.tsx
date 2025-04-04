
import { useState, useRef, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AudioPlayerProps {
  audioURL: string | null;
  isVisible: boolean;
}

export function AudioPlayer({ audioURL, isVisible }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
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
    if (!audioURL) return;
    
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
      audioElementRef.current = audio;
      audio.play().catch(err => {
        console.error("Error playing audio:", err);
      });
    } else {
      if (isPlaying) {
        audioElementRef.current.pause();
      } else {
        audioElementRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
        });
      }
    }
  };

  // Reset audio player when audio URL changes
  useEffect(() => {
    if (audioURL && !audioElementRef.current) {
      const audio = new Audio(audioURL);
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration || 0);
      };
      audioElementRef.current = audio;
    }
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
      <Button
        variant="secondary"
        size="lg"
        onClick={handlePlayAudio}
        className="mb-4"
      >
        <Volume2 className="mr-2 h-5 w-5" />
        {isPlaying ? "Pausar Audio" : "Reproducir Audio"}
      </Button>
      
      <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
        <span>{formatTime(audioDuration * (audioProgress / 100))}</span>
        <span>{formatTime(audioDuration)}</span>
      </div>
      <Progress value={audioProgress} className="h-2" />
    </div>
  );
}
