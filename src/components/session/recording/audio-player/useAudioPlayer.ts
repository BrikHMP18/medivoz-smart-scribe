import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { forceLoadMetadata, preloadAudio } from "@/utils/audio";

export function useAudioPlayer(audioURL: string | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  
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
          audioRef.current.preload = "auto";
          
          // Configure audio element events
          audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
          audioRef.current.addEventListener("ended", handleEnded);
          audioRef.current.addEventListener("error", (ev: Event) => handleError(ev));
          audioRef.current.addEventListener("canplay", handleCanPlay);
          audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
          
          // Force load metadata to get duration
          await forceLoadMetadata(audioRef.current);
          
          setIsLoaded(true);
          console.log("Audio player initialized with URL:", audioURL);
          
          // Try autoplay after a short delay
          setTimeout(() => {
            if (isMounted && audioRef.current) {
              tryAutoPlay();
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
      cleanupAudio();
    };
  }, [audioURL]);
  
  const tryAutoPlay = () => {
    if (!audioRef.current) return;
    
    try {
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromiseRef.current = playPromise;
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log("Auto-play successful");
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
  };
  
  const cleanupAudio = () => {
    if (audioRef.current) {
      try {
        // Clean up event listeners
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("error", (ev: Event) => handleError(ev));
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

  const handleError = (event: Event) => {
    const audioElement = event.target as HTMLAudioElement;
    const error = audioElement.error;
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return {
    isPlaying,
    currentTime,
    duration,
    isLoaded,
    handlePlayPause,
    handleSeek
  };
}
