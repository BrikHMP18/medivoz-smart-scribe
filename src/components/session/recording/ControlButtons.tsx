
import { Button } from "@/components/ui/button";
import { Play, Square, Mic, Pause } from "lucide-react";

interface ControlButtonsProps {
  isRecording: boolean;
  isPaused: boolean;
  isTranscribing: boolean;
  isPatientSelected: boolean;
  audioURL: string | null;
  sessionId: string;
  permissionDenied: boolean;
  onRequestPermission: () => Promise<boolean>;
  onGenerateSessionId: () => void;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
}

export function ControlButtons({
  isRecording,
  isPaused,
  isTranscribing,
  isPatientSelected,
  audioURL,
  sessionId,
  permissionDenied,
  onRequestPermission,
  onGenerateSessionId,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording
}: ControlButtonsProps) {
  // Handle permission request
  const handlePermissionRequest = async () => {
    if (await onRequestPermission()) {
      onGenerateSessionId();
    }
  };

  return (
    <div className="flex gap-3 items-center flex-wrap justify-center">
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
      
      {sessionId && !isRecording && !isTranscribing && !audioURL && (
        <Button
          variant="default"
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onStartRecording}
          disabled={permissionDenied}
        >
          <Play className="mr-2 h-5 w-5" />
          Iniciar Grabación
        </Button>
      )}
      
      {isRecording && !isPaused && (
        <>
          <Button
            variant="outline"
            size="lg"
            onClick={onPauseRecording}
            className="border-amber-500 text-amber-500 hover:bg-amber-50"
          >
            <Pause className="mr-2 h-4 w-4" />
            Pausar Grabación
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={onStopRecording}
          >
            <Square className="mr-2 h-4 w-4" />
            Detener Grabación
          </Button>
        </>
      )}
      
      {isRecording && isPaused && (
        <>
          <Button
            variant="default"
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={onResumeRecording}
          >
            <Play className="mr-2 h-5 w-5" />
            Reanudar Grabación
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={onStopRecording}
          >
            <Square className="mr-2 h-4 w-4" />
            Detener Grabación
          </Button>
        </>
      )}
    </div>
  );
}
