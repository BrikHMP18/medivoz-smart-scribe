
import { Button } from "@/components/ui/button";
import { Play, Square, Mic, MicOff } from "lucide-react";

interface RecordingControlsProps {
  isRecording: boolean;
  isPatientSelected: boolean;
  sessionId: string;
  recordingTime: number;
  onGenerateSessionId: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function RecordingControls({
  isRecording,
  isPatientSelected,
  sessionId,
  recordingTime,
  onGenerateSessionId,
  onStartRecording,
  onStopRecording
}: RecordingControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 items-center">
        {!sessionId && isPatientSelected && (
          <Button 
            variant="outline" 
            size="lg"
            onClick={onGenerateSessionId}
          >
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
        
        {sessionId && !isRecording && (
          <Button
            variant="default"
            size="lg"
            className="bg-medivoz-500 hover:bg-medivoz-600"
            onClick={onStartRecording}
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
      </div>
      
      {isRecording && (
        <div className="flex items-center gap-2 text-red-500 animate-pulse">
          <Mic className="h-5 w-5" />
          <span className="font-medium">Grabando: {formatTime(recordingTime)}</span>
        </div>
      )}
      
      {sessionId && !isRecording && (
        <div className="flex items-center gap-2 text-green-500">
          <MicOff className="h-5 w-5" />
          <span className="font-medium">Listo para grabar</span>
        </div>
      )}
    </div>
  );
}
