
/**
 * Precarga un archivo de audio para mejor reproducción
 * @param url - La URL del archivo de audio
 * @returns Una promesa que se resuelve cuando el audio está cargado
 */
export const preloadAudio = (url: string | null): Promise<HTMLAudioElement | null> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    
    const audio = new Audio();
    
    const onLoaded = () => {
      console.log("Audio precargado exitosamente:", url);
      audio.removeEventListener('canplaythrough', onLoaded);
      resolve(audio);
    };
    
    const onError = (error: Event) => {
      console.error("Error al precargar audio:", error);
      audio.removeEventListener('error', onError);
      resolve(null);
    };
    
    audio.addEventListener('canplaythrough', onLoaded);
    audio.addEventListener('error', onError);
    audio.preload = 'auto';
    
    // Usar un timeout más largo para asegurar que el audio se carga correctamente
    const timeoutMs = 8000; // 8 segundos
    setTimeout(() => {
      audio.removeEventListener('canplaythrough', onLoaded);
      audio.removeEventListener('error', onError);
      console.warn(`Tiempo de espera de precarga de audio agotado después de ${timeoutMs}ms, continuando de todos modos`);
      resolve(audio);
    }, timeoutMs);
    
    // Asignar src después de configurar los listeners
    audio.src = url;
    audio.load();
  });
};

/**
 * Fuerza al navegador a cargar los metadatos de audio
 * @param audioElement - El elemento de audio para cargar metadatos
 * @returns Una promesa que se resuelve cuando los metadatos están cargados o se rechaza en caso de error
 */
export const forceLoadMetadata = (audioElement: HTMLAudioElement): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (audioElement.readyState >= 1) {
      // Los metadatos ya están cargados
      resolve();
      return;
    }
    
    const handleLoadedMetadata = () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('error', handleError);
      resolve();
    };
    
    const handleError = (e: Event) => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('error', handleError);
      reject(new Error(`Error al cargar metadatos de audio: ${(e.target as HTMLAudioElement).error?.message || 'Error desconocido'}`));
    };
    
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('error', handleError);
    
    // Intentar forzar la carga de metadatos
    audioElement.load();
    
    // Algunos navegadores pueden necesitar un intento de reproducción para cargar los metadatos
    const attemptPlayForMetadata = () => {
      if (audioElement.paused) {
        try {
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                audioElement.pause();
                audioElement.currentTime = 0;
              })
              .catch(err => {
                console.log("Intento de reproducción para cargar metadatos falló:", err);
                // No es un problema crítico, el usuario tendrá que iniciar la reproducción manualmente
              });
          }
        } catch (err) {
          console.log("Error en intento de reproducción para metadatos:", err);
        }
      }
    };
    
    // Intentar reproducir después de un breve retraso para permitir la carga inicial
    setTimeout(attemptPlayForMetadata, 300);
    
    // Establecer un tiempo de espera más largo para resolver de todos modos después de 6 segundos
    setTimeout(() => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('error', handleError);
      console.warn("Carga de metadatos agotada, continuando de todos modos");
      resolve();
    }, 6000);
  });
};

/**
 * Carga segura de un archivo de audio con manejo de errores adecuado
 * @param url - La URL del archivo de audio
 * @param onSuccess - Callback para carga exitosa
 * @param onError - Callback para error
 * @returns El elemento de audio creado
 */
export const safeLoadAudio = (
  url: string, 
  onSuccess?: (audio: HTMLAudioElement) => void,
  onError?: (error: Error) => void
): HTMLAudioElement => {
  const audio = new Audio();
  
  audio.addEventListener('canplay', () => {
    if (onSuccess) onSuccess(audio);
  });
  
  audio.addEventListener('error', (event) => {
    const errorMsg = audio.error ? 
      `Error al cargar audio: ${audio.error.code} - ${audio.error.message}` : 
      'Error desconocido al cargar audio';
    console.error(errorMsg);
    if (onError) onError(new Error(errorMsg));
  });
  
  // Agregar manejador para metadatos cargados
  audio.addEventListener('loadedmetadata', () => {
    if (isNaN(audio.duration) || !isFinite(audio.duration)) {
      console.warn("Duración de audio no válida al cargar metadatos, intentando corregir");
      // No hacer nada aquí, solo registrar el problema
    } else {
      console.log("Metadatos de audio cargados con duración:", audio.duration);
    }
  });
  
  // Agregar fuente con manejo de errores
  try {
    audio.preload = 'auto';
    audio.src = url;
    audio.load();
  } catch (error) {
    console.error('Excepción al establecer fuente de audio:', error);
    if (onError) onError(error instanceof Error ? error : new Error(String(error)));
  }
  
  return audio;
};
