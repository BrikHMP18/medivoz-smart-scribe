
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
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    // Reset player state when the audio URL changes
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (audioURL && audioRef.current) {
      // Clean up previous audio URL
      URL.revokeObjectURL(audioRef.current.src);
      
      // Set src and load the audio
      audioRef.current.src = audioURL;
      audioRef.current.load();
      console.log("Audio URL loaded:", audioURL);
    }
    
    return () => {
      if (audioRef.current?.src) {
        // Clean up audio URL when component unmounts
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, [audioURL]);

  // Ensure volume is applied after component mounts
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
      // If currently playing, pause the audio
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            // Only pause after the play promise resolves
            audioRef.current?.pause();
            setIsPlaying(false);
          })
          .catch(error => {
            console.error("Error with play promise during pause:", error);
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      try {
        // Store the play promise
        console.log("Attempting to play audio...");
        audioRef.current.currentTime = currentTime;
        playPromiseRef.current = audioRef.current.play();
        
        // Only set the state to playing after the promise resolves
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              console.log("Audio playback started successfully");
              setIsPlaying(true);
              playPromiseRef.current = null;
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              toast.error("Error al reproducir el audio. Por favor, intente de nuevo.");
              setIsPlaying(false);
              playPromiseRef.current = null;
            });
        }
      } catch (error) {
        console.error("Exception during play:", error);
        toast.error("Error al reproducir el audio. Por favor, intente de nuevo.");
        setIsPlaying(false);
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const error = (e.target as HTMLAudioElement).error;
    console.error("Audio error:", error);
    console.error("Audio error code:", error?.code);
    console.error("Audio error message:", error?.message);
    toast.error("Error al cargar el audio. Por favor, intente grabar nuevamente.");
  };

  return (
    <div className="w-full p-4 bg-card rounded-md border shadow-sm">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
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
        
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>
      
      <div className="text-center mt-2">
        <span className="text-sm text-primary font-medium">
          {isPlaying ? "Reproduciendo..." : "Listo para reproducir"}
        </span>
      </div>
    </div>
  );
}
