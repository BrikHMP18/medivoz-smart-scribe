import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const AUDIO_BUCKET = "audio-recordings";

/**
 * Uploads an audio blob to Supabase Storage
 * @param audioBlob - The audio blob to upload
 * @param sessionId - The database session ID to associate the audio with
 * @param doctorId - The doctor's user ID for folder organization
 * @returns The storage path if successful, null otherwise
 */
export async function uploadAudioToStorage(
  audioBlob: Blob,
  sessionId: string,
  doctorId: string
): Promise<string | null> {
  if (!audioBlob || audioBlob.size === 0) {
    logger.error("Cannot upload empty audio blob");
    return null;
  }

  const extension = getExtensionFromMimeType(audioBlob.type);
  const path = `${doctorId}/${sessionId}.${extension}`;

  try {
    logger.log(`Uploading audio to storage: ${path} (${audioBlob.size} bytes)`);

    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(path, audioBlob, {
        contentType: audioBlob.type || "audio/webm",
        upsert: true,
      });

    if (error) {
      logger.error("Error uploading audio to storage:", error);
      return null;
    }

    logger.log("Audio uploaded successfully:", data.path);

    // Update the session record with the audio path
    const { error: updateError } = await supabase
      .from("sesiones")
      .update({ audio_url: data.path })
      .eq("id", sessionId);

    if (updateError) {
      logger.warn("Audio uploaded but failed to update session record:", updateError);
    }

    return data.path;
  } catch (error) {
    logger.error("Unexpected error uploading audio:", error);
    return null;
  }
}

/**
 * Gets a public/signed URL for an audio recording
 * @param storagePath - The storage path returned from upload
 * @param expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns The signed URL or null
 */
export async function getAudioUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      logger.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    logger.error("Unexpected error getting audio URL:", error);
    return null;
  }
}

function getExtensionFromMimeType(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}
