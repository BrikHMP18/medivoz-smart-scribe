
import { Mic, Pause, Loader2, MicOff, CheckCircle } from "lucide-react";

interface RecordingStatusProps {
  isRecording: boolean;
  isPaused: boolean;
  isTranscribing: boolean;
  sessionId: string;
  recordingTime: number;
  audioURL: string | null;
}

export function RecordingStatus({
  isRecording,
  isPaused,
  isTranscribing,
  sessionId,
  recordingTime,
  audioURL
}: RecordingStatusProps) {
  const formatTime = (seconds: number) => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 text-red-500 mb-2">
        {isPaused ? (
          <Pause className="h-5 w-5 text-amber-500" />
        ) : (
          <Mic className="h-5 w-5 animate-pulse" />
        )}
        <span className="font-medium">
          {isPaused ? "Grabación pausada: " : "Grabando: "}
          {formatTime(recordingTime)}
        </span>
      </div>
    );
  }

  if (isTranscribing) {
    return (
      <div className="flex items-center gap-2 text-amber-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-medium">Transcribiendo audio...</span>
      </div>
    );
  }

  if (sessionId && !isRecording && !isTranscribing && audioURL) {
    return (
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">Audio grabado correctamente</span>
      </div>
    );
  }

  if (sessionId && !isRecording && !isTranscribing) {
    return (
      <div className="flex items-center gap-2 text-green-500">
        <MicOff className="h-5 w-5" />
        <span className="font-medium">Listo para grabar</span>
      </div>
    );
  }

  return null;
}
