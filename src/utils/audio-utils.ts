
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

