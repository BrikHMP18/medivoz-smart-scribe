
import { useEffect, useRef, useState } from "react";
import { Volume2, Play, Pause, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { forceLoadMetadata, preloadAudio } from "@/utils/audio-utils";
import { Progress } from "@/components/ui/progress";

interface AudioPlayerProps {
  audioURL: string | null;
  isVisible: boolean;
}

export function AudioPlayer({ audioURL, isVisible }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8); // Default volume at 80%
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const prevVolumeRef = useRef(volume);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Reset player state and preload audio when the URL changes
  useEffect(() => {
    let isMounted = true;
    
    const initializeAudio = async () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setIsLoaded(false);
      
      if (!audioURL) {
        return;
      }
      
      console.log("New audio URL detected:", audioURL);
      
      try {
        // Preload the audio
        const preloadedAudio = await preloadAudio(audioURL);
        
        if (!isMounted) return;
        
        if (preloadedAudio) {
          // Clean up any existing audio element
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current.load();
          }
          
          audioRef.current = new Audio(audioURL);
          audioRef.current.volume = isMuted ? 0 : volume;
          audioRef.current.preload = "auto";
          
          // Configure audio element events
          audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
          audioRef.current.addEventListener("ended", handleEnded);
          audioRef.current.addEventListener("error", handleError);
          audioRef.current.addEventListener("canplay", handleCanPlay);
          audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
          
          // Force load metadata to get duration
          await forceLoadMetadata(audioRef.current);
          
          setIsLoaded(true);
          console.log("Audio player initialized with URL:", audioURL);
          
          // Try autoplay after a short delay
          setTimeout(() => {
            if (isMounted && audioRef.current) {
              try {
                const playPromise = audioRef.current.play();
                if (playPromise) {
                  playPromiseRef.current = playPromise;
                  playPromise
                    .then(() => {
                      if (isMounted) {
                        setIsPlaying(true);
                        console.log("Auto-play successful");
                      }
                      playPromiseRef.current = null;
                    })
                    .catch(error => {
                      // Auto-play was prevented (expected on many browsers)
                      console.log("Auto-play prevented:", error);
                      playPromiseRef.current = null;
                    });
                }
              } catch (error) {
                console.error("Error during auto-play attempt:", error);
              }
            }
          }, 500);
        } else {
          console.error("Failed to preload audio");
          if (isMounted) {
            toast.error("Error al cargar el audio");
          }
        }
      } catch (error) {
        console.error("Error initializing audio:", error);
        if (isMounted) {
          toast.error("Error al inicializar el reproductor de audio");
        }
      }
    };
    
    initializeAudio();
    
    return () => {
      isMounted = false;
      if (audioRef.current) {
        try {
          // Clean up event listeners
          audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
          audioRef.current.removeEventListener("ended", handleEnded);
          audioRef.current.removeEventListener("error", handleError);
          audioRef.current.removeEventListener("canplay", handleCanPlay);
          audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
          
          // Properly handle play promise before pausing
          if (playPromiseRef.current) {
            playPromiseRef.current
              .then(() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.src = "";
                  audioRef.current.load();
                }
              })
              .catch(() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.src = "";
                  audioRef.current.load();
                }
              });
          } else {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current.load();
          }
        } catch (e) {
          console.error("Error cleaning up audio:", e);
        }
      }
    };
  }, [audioURL, volume, isMuted]);

  // Apply volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      console.log("Audio metadata loaded, duration:", audioDuration);
      
      if (isNaN(audioDuration) || !isFinite(audioDuration)) {
        console.warn("Invalid audio duration:", audioDuration);
        setDuration(0);
      } else {
        setDuration(audioDuration);
      }
    }
  };

  const handleCanPlay = () => {
    console.log("Audio can play now, duration:", audioRef.current?.duration);
    if (audioRef.current && !isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    console.log("Audio playback ended");
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
    console.error("Audio src:", audioRef.current?.src);
    toast.error("Error al reproducir el audio. Por favor, intente grabar nuevamente.");
  };

  // Playback control functions
  const handlePlayPause = () => {
    if (!audioRef.current || !isLoaded) {
      toast.error("Audio no está listo para reproducirse");
      return;
    }
    
    if (isPlaying) {
      // If currently playing, pause the audio
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
    prevVolumeRef.current = newVolume;
  };
  
  const toggleMute = () => {
    setIsMuted(prev => {
      // If unmuting, restore previous volume
      if (prev && volume === 0) {
        setVolume(prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.8);
      }
      return !prev;
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Helper functions
  const formatTime = (time: number): string => {
    if (isNaN(time) || !isFinite(time)) {
      return "00:00";
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible || !audioURL) {
    return null;
  }

  return (
    <div className="w-full p-4 bg-card rounded-md border shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePlayPause}
          disabled={!isLoaded}
          className="p-2 rounded-full bg-primary/90 text-primary-foreground hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={!isLoaded}
          />
          
          <Progress 
            value={(currentTime / (duration || 1)) * 100} 
            className="h-1 w-full" 
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={!isLoaded}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            disabled={!isLoaded}
          />
        </div>
      </div>
      
      <div className="text-center mt-2">
        <span className="text-sm text-primary font-medium">
          {!isLoaded ? "Cargando audio..." : 
            isPlaying ? "Reproduciendo..." : "Listo para reproducir"}
        </span>
      </div>
    </div>
  );
}
