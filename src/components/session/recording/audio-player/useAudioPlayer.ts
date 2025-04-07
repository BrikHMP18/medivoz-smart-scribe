
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
  const hasAudioLoadedRef = useRef<boolean>(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const initializeAudio = async () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setIsLoaded(false);
      hasAudioLoadedRef.current = false;
      
      if (!audioURL) {
        return;
      }
      
      console.log("Nueva URL de audio detectada:", audioURL);
      
      try {
        // Precargar el audio
        const preloadedAudio = await preloadAudio(audioURL);
        
        if (!isMounted) return;
        
        if (preloadedAudio) {
          // Limpiar cualquier elemento de audio existente
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current.load();
          }
          
          audioRef.current = new Audio(audioURL);
          audioRef.current.preload = "auto";
          
          // Configurar eventos del elemento de audio
          audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
          audioRef.current.addEventListener("ended", handleEnded);
          audioRef.current.addEventListener("error", handleError);
          audioRef.current.addEventListener("canplay", handleCanPlay);
          audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
          audioRef.current.addEventListener("durationchange", handleDurationChange);
          
          // Forzar carga de metadatos para obtener duración
          try {
            await forceLoadMetadata(audioRef.current);
            
            if (isMounted) {
              hasAudioLoadedRef.current = true;
              setIsLoaded(true);
              console.log("Reproductor de audio inicializado con URL:", audioURL);
              
              // Intentar reproducción automática después de un breve retraso
              setTimeout(() => {
                if (isMounted && audioRef.current && hasAudioLoadedRef.current) {
                  tryAutoPlay();
                }
              }, 800);
            }
          } catch (err) {
            console.warn("Error en carga de metadatos:", err);
            // Continuar de todos modos, confiaremos en los eventos canplay
            if (isMounted) {
              hasAudioLoadedRef.current = true;
              setIsLoaded(true);
            }
          }
        } else {
          console.error("Error al precargar audio");
          if (isMounted) {
            toast.error("Error al cargar el audio");
          }
        }
      } catch (error) {
        console.error("Error al inicializar audio:", error);
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
    if (!audioRef.current || !hasAudioLoadedRef.current) return;
    
    try {
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromiseRef.current = playPromise;
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log("Auto-reproducción exitosa");
            playPromiseRef.current = null;
          })
          .catch(error => {
            // Auto-reproducción fue impedida (esperado en muchos navegadores)
            console.log("Auto-reproducción impedida:", error);
            playPromiseRef.current = null;
          });
      }
    } catch (error) {
      console.error("Error durante intento de auto-reproducción:", error);
    }
  };
  
  const cleanupAudio = () => {
    if (audioRef.current) {
      try {
        // Limpiar event listeners
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("error", handleError);
        audioRef.current.removeEventListener("canplay", handleCanPlay);
        audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audioRef.current.removeEventListener("durationchange", handleDurationChange);
        
        // Manejar adecuadamente la promesa de reproducción antes de pausar
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
        console.error("Error al limpiar audio:", e);
      }
    }
  };

  // Manejadores de eventos
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleDurationChange = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      if (!isNaN(audioDuration) && isFinite(audioDuration)) {
        console.log("Duración de audio actualizada:", audioDuration);
        setDuration(audioDuration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      console.log("Metadatos de audio cargados, duración:", audioDuration);
      
      if (isNaN(audioDuration) || !isFinite(audioDuration)) {
        console.warn("Duración de audio no válida:", audioDuration);
        // No actualizamos la duración aquí, esperaremos el evento durationchange o canplay
      } else {
        setDuration(audioDuration);
      }
    }
  };

  const handleCanPlay = () => {
    console.log("Audio listo para reproducir, duración:", audioRef.current?.duration);
    if (audioRef.current && !isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
    
    // Asegurar que isLoaded sea true incluso si los metadatos fallan
    hasAudioLoadedRef.current = true;
    setIsLoaded(true);
  };

  const handleEnded = () => {
    console.log("Reproducción de audio finalizada");
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleError = (event: Event) => {
    const audioElement = event.target as HTMLAudioElement;
    const error = audioElement.error;
    console.error("Error de audio:", error);
    console.error("Código de error de audio:", error?.code);
    console.error("Mensaje de error de audio:", error?.message);
    console.error("Fuente de audio:", audioRef.current?.src);
    
    // Solo mostrar toast si el audio debería estar cargado pero falló
    if (hasAudioLoadedRef.current) {
      toast.error("Error al reproducir el audio. Por favor, intente grabar nuevamente.");
    }
  };

  // Funciones de control de reproducción
  const handlePlayPause = () => {
    if (!audioRef.current || !isLoaded) {
      toast.error("Audio no está listo para reproducirse");
      return;
    }
    
    if (isPlaying) {
      // Si está reproduciendo, pausar el audio
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
          })
          .catch(error => {
            console.error("Error con promesa de reproducción durante pausa:", error);
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      try {
        // Almacenar la promesa de reproducción
        console.log("Intentando reproducir audio...");
        audioRef.current.currentTime = currentTime;
        playPromiseRef.current = audioRef.current.play();
        
        // Solo establecer estado a reproduciendo después de que la promesa se resuelva
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              console.log("Reproducción de audio iniciada exitosamente");
              setIsPlaying(true);
              playPromiseRef.current = null;
            })
            .catch(error => {
              console.error("Error al reproducir audio:", error);
              toast.error("Error al reproducir el audio. Por favor, intente de nuevo.");
              setIsPlaying(false);
              playPromiseRef.current = null;
            });
        }
      } catch (error) {
        console.error("Excepción durante reproducción:", error);
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
