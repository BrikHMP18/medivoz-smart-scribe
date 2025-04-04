
import { Button } from "@/components/ui/button";
import { Play, Square, Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import { Waveform } from "./Waveform";
import { useState } from "react";

interface RecordingControlsProps {
  isRecording: boolean;
  isPatientSelected: boolean;
  isTranscribing: boolean;
  audioURL: string | null;
  audioWaveform: number[];
  sessionId: string;
  recordingTime: number;
  permissionDenied: boolean;
  onRequestPermission: () => Promise<boolean>;
  onGenerateSessionId: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function RecordingControls({
  isRecording,
  isPatientSelected,
  isTranscribing,
  audioURL,
  audioWaveform,
  sessionId,
  recordingTime,
  permissionDenied,
  onRequestPermission,
  onGenerateSessionId,
  onStartRecording,
  onStopRecording
}: RecordingControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio playback
  const handlePlayAudio = () => {
    if (!audioURL) return;
    
    if (!audioElement) {
      const audio = new Audio(audioURL);
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
    } else {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    }
  };

  // Handle permission request
  const handlePermissionRequest = async () => {
    if (await onRequestPermission()) {
      onGenerateSessionId();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 items-center flex-wrap justify-center">
        {!sessionId && isPatientSelected && (
          <Button 
            variant="outline" 
            size="lg"
            onClick={handlePermissionRequest}
            disabled={permissionDenied}
          >
            <Mic className="mr-2 h-5 w-5" />
            Generar Código de Sesión
          </Button>
        )}
        
        {!isPatientSelected && (
          <Button
            variant="outline"
            size="lg"
            disabled
          >
            Seleccione un paciente primero
          </Button>
        )}
        
        {sessionId && !isRecording && !isTranscribing && (
          <Button
            variant="default"
            size="lg"
            className="bg-medivoz-500 hover:bg-medivoz-600"
            onClick={onStartRecording}
            disabled={permissionDenied}
          >
            <Play className="mr-2 h-5 w-5" />
            Iniciar Grabación
          </Button>
        )}
        
        {isRecording && (
          <Button
            variant="destructive"
            size="lg"
            onClick={onStopRecording}
          >
            <Square className="mr-2 h-4 w-4" />
            Detener Grabación
          </Button>
        )}

        {audioURL && !isRecording && !isTranscribing && (
          <Button
            variant="secondary"
            size="lg"
            onClick={handlePlayAudio}
          >
            <Volume2 className="mr-2 h-5 w-5" />
            {isPlaying ? "Pausar Audio" : "Reproducir Audio"}
          </Button>
        )}
      </div>
      
      {isRecording && (
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 text-red-500 animate-pulse mb-2">
            <Mic className="h-5 w-5" />
            <span className="font-medium">Grabando: {formatTime(recordingTime)}</span>
          </div>
          <Waveform data={audioWaveform} height={30} />
        </div>
      )}
      
      {isTranscribing && (
        <div className="flex items-center gap-2 text-amber-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Transcribiendo audio...</span>
        </div>
      )}
      
      {sessionId && !isRecording && !isTranscribing && (
        <div className="flex items-center gap-2 text-green-500">
          <MicOff className="h-5 w-5" />
          <span className="font-medium">Listo para grabar</span>
        </div>
      )}
    </div>
  );
}
