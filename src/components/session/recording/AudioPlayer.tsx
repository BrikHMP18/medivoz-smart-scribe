
import { useEffect, useRef, useState } from "react";
import { Volume2, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface AudioPlayerProps {
  audioURL: string | null;
  isVisible: boolean;
}

export function AudioPlayer({ audioURL, isVisible }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    // Reset player state when the audio URL changes
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (audioURL && audioRef.current) {
      // Set src and load the audio
      audioRef.current.src = audioURL;
      audioRef.current.load();
    }
  }, [audioURL]);

  if (!isVisible || !audioURL) {
    return null;
  }

  const formatTime = (time: number): string => {
    if (isNaN(time) || !isFinite(time)) {
      return "00:00";
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      // Make sure any ongoing play promise is resolved before pausing
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            audioRef.current?.pause();
          })
          .catch((error) => {
            console.error("Error resolving play promise:", error);
          });
      } else {
        audioRef.current.pause();
      }
    } else {
      // Store the play promise so we can handle it properly
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromiseRef.current = playPromise;
        
        playPromise
          .then(() => {
            // Playback started successfully
            console.log("Audio playback started successfully");
            playPromiseRef.current = null;
          })
          .catch(error => {
            // Playback failed
            console.error("Error playing audio:", error);
            toast.error("Error al reproducir el audio. Por favor, intente de nuevo.");
            setIsPlaying(false);
            playPromiseRef.current = null;
          });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      console.log("Audio metadata loaded, duration:", audioRef.current.duration);
      
      if (isNaN(audioRef.current.duration) || !isFinite(audioRef.current.duration)) {
        console.warn("Invalid audio duration:", audioRef.current.duration);
        setDuration(0);
      } else {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error("Audio error:", (e.target as HTMLAudioElement).error);
    toast.error("Error al cargar el audio. Por favor, intente grabar nuevamente.");
  };

  return (
    <div className="w-full p-4 bg-card rounded-md border shadow-sm">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
        className="hidden"
      />
      
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePlayPause}
          className="p-2 rounded-full bg-primary/90 text-primary-foreground hover:bg-primary transition-colors"
          aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>
        
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            step="0.01"
          />
        </div>
        
        <Volume2 className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="text-center mt-2">
        <span className="text-sm text-primary font-medium">
          {isPlaying ? "Reproduciendo..." : "Listo para reproducir"}
        </span>
      </div>
    </div>
  );
}
