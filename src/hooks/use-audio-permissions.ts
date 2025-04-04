
import { useState } from "react";
import { toast } from "sonner";

export function useAudioPermissions() {
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionDenied(false);
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      setPermissionDenied(true);
      toast.error("No se pudo acceder al micrófono. Por favor, conceda permiso para continuar.");
      return false;
    }
  };

  return {
    permissionDenied,
    requestPermission
  };
}
