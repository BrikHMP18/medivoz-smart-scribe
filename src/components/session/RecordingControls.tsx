
import { Button } from "@/components/ui/button";
import { Play, Square, Mic, MicOff, Loader2, Volume2, Pause } from "lucide-react";
import { Waveform } from "./Waveform";
import { useState, useRef, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
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
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
}

export function RecordingControls({
  isRecording,
  isPaused,
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
  onPauseRecording,
  onResumeRecording,
  onStopRecording
}: RecordingControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio playback
  const handlePlayAudio = () => {
    if (!audioURL) return;
    
    if (!audioElementRef.current) {
      const audio = new Audio(audioURL);
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
      };
      audio.onplay = () => {
        setIsPlaying(true);
        startProgressTracking(audio);
      };
      audio.onpause = () => {
        setIsPlaying(false);
        stopProgressTracking();
      };
      audio.onended = () => {
        setIsPlaying(false);
        setAudioProgress(100);
        stopProgressTracking();
      };
      audioElementRef.current = audio;
      audio.play();
    } else {
      if (isPlaying) {
        audioElementRef.current.pause();
        stopProgressTracking();
      } else {
        audioElementRef.current.play();
        startProgressTracking(audioElementRef.current);
      }
    }
  };

  const startProgressTracking = (audio: HTMLAudioElement) => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = window.setInterval(() => {
      const progress = (audio.currentTime / audio.duration) * 100;
      setAudioProgress(progress);
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Handle permission request
  const handlePermissionRequest = async () => {
    if (await onRequestPermission()) {
      onGenerateSessionId();
    }
  };

  // Clean up audio element and interval on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      stopProgressTracking();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
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
            className="bg-medivoz-500 hover:bg-medivoz-600"
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
              className="bg-medivoz-500 hover:bg-medivoz-600"
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
        <div className="w-full">
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
          <Waveform data={audioWaveform} height={40} isActive={!isPaused} />
        </div>
      )}
      
      {audioURL && !isRecording && !isTranscribing && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
            <span>{formatTime(audioDuration * (audioProgress / 100))}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
          <Progress value={audioProgress} className="h-2" />
        </div>
      )}
      
      {isTranscribing && (
        <div className="flex items-center gap-2 text-amber-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Transcribiendo audio...</span>
        </div>
      )}
      
      {sessionId && !isRecording && !isTranscribing && !audioURL && (
        <div className="flex items-center gap-2 text-green-500">
          <MicOff className="h-5 w-5" />
          <span className="font-medium">Listo para grabar</span>
        </div>
      )}
    </div>
  );
}
