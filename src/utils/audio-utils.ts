
/**
 * Utility functions for audio processing
 */

/**
 * Converts a Blob to base64 string
 * @param blob - The audio blob to convert
 * @returns A promise that resolves to a base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("FileReader result is not a string"));
      }
    };
    reader.onerror = (event) => {
      console.error("FileReader error:", reader.error);
      reject(new Error("FileReader error: " + (reader.error?.message || "Unknown error")));
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Validates an audio blob
 * @param blob - The audio blob to validate
 * @returns True if the blob is valid, false otherwise
 */
export const validateAudioBlob = (blob: Blob | null): boolean => {
  if (!blob) {
    console.error("Audio blob is null");
    return false;
  }
  
  if (blob.size === 0) {
    console.error("Audio blob size is 0");
    return false;
  }
  
  // Check if the MIME type is valid
  const validTypes = [
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/wav',
    'audio/mpeg'
  ];
  
  if (!validTypes.includes(blob.type) && blob.type !== '') {
    console.warn("Unexpected audio MIME type:", blob.type);
    // We don't return false here because some browsers might use custom MIME types
  }
  
  console.log(`Audio blob validated: ${blob.size} bytes, type: ${blob.type}`);
  return true;
};

/**
 * Determines the best supported audio MIME type for the browser
 * @returns The best supported MIME type or empty string if none is supported
 */
export const getBestSupportedMimeType = (): string => {
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    'audio/mpeg'
  ];
  
  for (const type of mimeTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log("Using MIME type:", type);
      return type;
    }
  }
  
  console.warn("No supported MIME types found, using default");
  return '';  // Let browser choose default
};

/**
 * Creates a blob URL from a blob
 * @param blob - The blob to create a URL for
 * @returns The created URL or null if the blob is invalid
 */
export const createBlobURL = (blob: Blob | null): string | null => {
  if (!validateAudioBlob(blob)) {
    return null;
  }
  
  const url = URL.createObjectURL(blob);
  console.log("Created audio URL:", url);
  return url;
};

/**
 * Revokes a blob URL
 * @param url - The URL to revoke
 */
export const revokeBlobURL = (url: string | null): void => {
  if (url) {
    URL.revokeObjectURL(url);
    console.log("Revoked audio URL:", url);
  }
};

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
 * Creates a safe listener for audio elements that can be properly removed
 * @param handler - The event handler function
 * @returns A function that can be used as an event listener
 */
export const createSafeAudioErrorListener = (handler: (error: MediaError | null) => void) => {
  return (event: Event) => {
    const audioElement = event.target as HTMLAudioElement;
    handler(audioElement.error);
  };
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
