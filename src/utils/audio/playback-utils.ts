
/**
 * Preloads an audio file for better playback
 * @param url - The URL of the audio file
 * @returns A promise that resolves when the audio is loaded
 */
export const preloadAudio = (url: string | null): Promise<HTMLAudioElement | null> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    
    const audio = new Audio();
    
    const onLoaded = () => {
      console.log("Audio preloaded successfully:", url);
      audio.removeEventListener('canplaythrough', onLoaded);
      resolve(audio);
    };
    
    const onError = (error: Event) => {
      console.error("Error preloading audio:", error);
      audio.removeEventListener('error', onError);
      resolve(null);
    };
    
    audio.addEventListener('canplaythrough', onLoaded);
    audio.addEventListener('error', onError);
    audio.preload = 'auto';
    audio.src = url;
    audio.load();
    
    // Set a timeout to resolve anyway after 5 seconds
    setTimeout(() => {
      audio.removeEventListener('canplaythrough', onLoaded);
      audio.removeEventListener('error', onError);
      console.warn("Audio preload timed out, continuing anyway");
      resolve(audio);
    }, 5000);
  });
};

/**
 * Force browser to load audio metadata
 * @param audioElement - The audio element to load metadata for
 * @returns A promise that resolves when metadata is loaded or rejects on error
 */
export const forceLoadMetadata = (audioElement: HTMLAudioElement): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (audioElement.readyState >= 1) {
      // Metadata is already loaded
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
      reject(new Error(`Error loading audio metadata: ${(e.target as HTMLAudioElement).error?.message || 'Unknown error'}`));
    };
    
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('error', handleError);
    
    // Try to force load the metadata
    if (audioElement.paused) {
      audioElement.load();
      
      // Some browsers need a play/pause to fully load metadata
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => audioElement.pause())
          .catch(err => console.warn("Play attempt to load metadata failed:", err));
      }
    }
    
    // Set a timeout to resolve anyway after 3 seconds
    setTimeout(() => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('error', handleError);
      console.warn("Metadata load timed out, continuing anyway");
      resolve();
    }, 3000);
  });
};

/**
 * Safely loads an audio file with proper error handling
 * @param url - The URL of the audio file
 * @param onSuccess - Callback for successful loading
 * @param onError - Callback for error
 * @returns The created audio element
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
      `Error loading audio: ${audio.error.code} - ${audio.error.message}` : 
      'Unknown audio loading error';
    console.error(errorMsg);
    if (onError) onError(new Error(errorMsg));
  });
  
  // Add source with error handling
  try {
    audio.src = url;
    audio.load();
  } catch (error) {
    console.error('Exception setting audio source:', error);
    if (onError) onError(error instanceof Error ? error : new Error(String(error)));
  }
  
  return audio;
};
