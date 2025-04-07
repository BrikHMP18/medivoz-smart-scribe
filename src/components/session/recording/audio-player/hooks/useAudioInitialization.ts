
import { useState, useEffect } from "react";
import { preloadAudio } from "@/utils/audio";
import { toast } from "sonner";

export function useAudioInitialization(
  audioURL: string | null,
  audioRef: React.RefObject<HTMLAudioElement>,
  handleTimeUpdate: () => void,
  handleEnded: () => void,
  handleError: (event: Event) => void
) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAudio = async () => {
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
          audioRef.current.addEventListener("error", handleError);
          
          setIsLoaded(true);
          console.log("Audio player initialized with URL:", audioURL);
          
          // Try autoplay after a short delay
          setTimeout(() => {
            if (isMounted && audioRef.current) {
              tryAutoPlay(audioRef.current);
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
      
      // Clean up the audio element
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("error", handleError);
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
    };
  }, [audioURL]);

  const tryAutoPlay = (audioElement: HTMLAudioElement) => {
    try {
      const playPromise = audioElement.play();
      if (playPromise) {
        playPromise
          .then(() => {
            console.log("Auto-play successful");
          })
          .catch(error => {
            // Auto-play was prevented (expected on many browsers)
            console.log("Auto-play prevented:", error);
          });
      }
    } catch (error) {
      console.error("Error during auto-play attempt:", error);
    }
  };

  return { isLoaded };
}
