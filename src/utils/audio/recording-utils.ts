
/**
 * Utility functions for audio recording
 */
import { validateAudioBlob, createBlobURL, revokeBlobURL } from './blob-utils';
import { getBestSupportedMimeType } from './format-utils';

/**
 * Creates an audio blob from audio chunks
 * @param audioChunks - The collected audio chunks
 * @param mimeType - The MIME type for the blob
 * @returns The created blob or null if creation fails
 */
export const createAudioBlobFromChunks = (
  audioChunks: Blob[],
  mimeType: string = 'audio/webm'
): Blob | null => {
  if (audioChunks.length === 0) {
    console.error("No audio chunks available");
    return null;
  }

  try {
    const type = mimeType || 'audio/webm';
    const audioBlob = new Blob(audioChunks, { type });
    console.log(`Created audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
    
    if (validateAudioBlob(audioBlob)) {
      return audioBlob;
    }
  } catch (error) {
    console.error("Error creating audio blob:", error);
  }
  
  return null;
};

/**
 * Safely stops all tracks in a media stream
 * @param stream - The media stream to stop
 */
export const stopMediaStreamTracks = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log("Track stopped:", track.kind);
    });
  }
};

/**
 * Manages state for the MediaRecorder
 * @param stream - The media stream to record
 * @param mimeType - The preferred MIME type
 * @param onDataAvailable - Callback for when data is available
 * @returns MediaRecorder instance or null if creation fails
 */
export const createMediaRecorder = (
  stream: MediaStream,
  mimeType: string,
  onDataAvailable: (event: BlobEvent) => void
): MediaRecorder | null => {
  try {
    const recorder = mimeType ? 
      new MediaRecorder(stream, { mimeType }) : 
      new MediaRecorder(stream);
      
    recorder.ondataavailable = onDataAvailable;
    return recorder;
  } catch (error) {
    console.error("Error creating MediaRecorder:", error);
    return null;
  }
};

/**
 * Updates an audio URL with a new blob, revoking the old URL
 * @param currentUrl - The current audio URL to revoke
 * @param blob - The new blob to create a URL for
 * @returns The new URL or null
 */
export const updateAudioURL = (currentUrl: string | null, blob: Blob | null): string | null => {
  revokeBlobURL(currentUrl);
  
  if (!blob) {
    return null;
  }
  
  return createBlobURL(blob);
};
