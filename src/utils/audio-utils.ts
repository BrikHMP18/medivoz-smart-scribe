
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
