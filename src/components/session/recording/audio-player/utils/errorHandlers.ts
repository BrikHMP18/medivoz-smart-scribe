
import { toast } from "sonner";

export const handleAudioError = (event: Event) => {
  const audioElement = event.target as HTMLAudioElement;
  const error = audioElement.error;
  console.error("Audio error:", error);
  console.error("Audio error code:", error?.code);
  console.error("Audio error message:", error?.message);
  console.error("Audio src:", audioElement?.src);
  toast.error("Error al reproducir el audio. Por favor, intente grabar nuevamente.");
};

export const createSafeErrorListener = (handler: (error: Event) => void) => {
  return (event: Event) => {
    try {
      handler(event);
    } catch (e) {
      console.error("Error in error handler:", e);
    }
  };
};
