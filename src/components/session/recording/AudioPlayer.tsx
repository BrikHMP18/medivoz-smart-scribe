
import { useAudioPlayer } from "./audio-player/useAudioPlayer";
import { PlayerControls } from "./audio-player/PlayerControls";
import { ProgressBar } from "./audio-player/ProgressBar";
import { StatusIndicator } from "./audio-player/StatusIndicator";

interface AudioPlayerProps {
  audioURL: string | null;
  isVisible: boolean;
}

export function AudioPlayer({ audioURL, isVisible }: AudioPlayerProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    isLoaded,
    handlePlayPause,
    handleSeek
  } = useAudioPlayer(audioURL);

  if (!isVisible || !audioURL) {
    return null;
  }

  return (
    <div className="w-full p-4 bg-card rounded-md border shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <PlayerControls
          isPlaying={isPlaying}
          isLoaded={isLoaded}
          onPlayPause={handlePlayPause}
        />
        
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          isLoaded={isLoaded}
          onSeek={handleSeek}
        />
      </div>
      
      <StatusIndicator isLoaded={isLoaded} isPlaying={isPlaying} />
    </div>
  );
}
