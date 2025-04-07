
import { useEffect } from "react";
import { revokeBlobURL } from "@/utils/audio";

export function useAudioCleanup(
  audioURL: string | null,
  audioRef: React.RefObject<HTMLAudioElement>,
  playPromiseRef: React.RefObject<Promise<void> | null>
) {
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [audioURL]);

  const cleanup = () => {
    revokeBlobURL(audioURL);
    
    if (audioRef.current) {
      try {
        // Properly handle play promise before pausing
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
        console.error("Error cleaning up audio:", e);
      }
    }
  };

  return { cleanup };
}
