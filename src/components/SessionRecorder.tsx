
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Play, Square } from "lucide-react";
import { toast } from "sonner";

interface SessionRecorderProps {
  onTranscriptionReady: (transcription: string) => void;
}

export function SessionRecorder({ onTranscriptionReady }: SessionRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerId, setTimerId] = useState<number | null>(null);

  const generateSessionId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionId(randomId);
    toast.success(`Sesión ${randomId} creada correctamente`);
    return randomId;
  };

  const handleStartRecording = () => {
    if (!sessionId) {
      generateSessionId();
    }
    
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
    const id = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    setTimerId(id);
    
    toast.success("Grabación iniciada");
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    // Clear timer
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    
    toast.success("Grabación detenida");

    // Simulate transcription being ready after 2 seconds
    setTimeout(() => {
      const mockTranscription = `
🩺 Doctor (00:00): Buenos días, ¿cómo se siente hoy?

👤 Paciente (00:03): Buenos días doctor. He estado teniendo fuertes dolores de cabeza desde hace una semana aproximadamente. Empiezan en la mañana y empeoran durante el día.

🩺 Doctor (00:15): Entiendo. ¿Estos dolores son constantes o vienen y van?

👤 Paciente (00:19): Vienen y van, pero últimamente son más frecuentes. También he notado que la luz intensa los empeora.

🩺 Doctor (00:28): ¿Había sufrido dolores de cabeza similares anteriormente?

👤 Paciente (00:32): No con esta intensidad. Ocasionalmente tengo dolores de cabeza por estrés, pero nada como esto.

🩺 Doctor (00:39): ¿Ha tomado algún medicamento para el dolor?

👤 Paciente (00:42): Sí, paracetamol, pero solo me alivia temporalmente.

🩺 Doctor (00:47): ¿Tiene antecedentes familiares de migraña u otros trastornos neurológicos?

👤 Paciente (00:53): Mi madre sufría de migrañas, ahora que lo menciona.

🩺 Doctor (01:00): Vamos a realizar un examen neurológico básico. Por favor, siga mi dedo con la vista sin mover la cabeza.

👤 Paciente (01:12): De acuerdo.

🩺 Doctor (01:25): Bien. Ahora voy a revisar sus reflejos... Todo parece normal. Basado en sus síntomas y el examen, parece que está experimentando migrañas. La sensibilidad a la luz es un síntoma clásico.

👤 Paciente (01:45): ¿Es grave?

🩺 Doctor (01:47): Las migrañas son tratables, aunque pueden ser molestas. Le voy a recetar Sumatriptán para los episodios agudos y discutiremos medidas preventivas, como identificar desencadenantes y técnicas de manejo del estrés.

👤 Paciente (02:01): ¿Debo realizar algún estudio adicional?

🩺 Doctor (02:04): Por ahora, no considero necesario realizar neuroimágenes, pero vamos a monitorear su respuesta al tratamiento. Si los síntomas persisten o cambian, podríamos considerar un estudio de resonancia magnética.

👤 Paciente (02:16): Entiendo, doctor. ¿Cuándo debería volver?

🩺 Doctor (02:19): Me gustaría verlo de nuevo en tres semanas. Por favor, lleve un diario de sus dolores de cabeza: frecuencia, duración, intensidad y posibles desencadenantes. Esto nos ayudará a ajustar el tratamiento si es necesario.

👤 Paciente (02:30): Lo haré, gracias doctor.
      `;
      onTranscriptionReady(mockTranscription);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-medivoz-400 to-medivoz-600"></div>
      
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Grabación de Sesión</h3>
          <p className="text-muted-foreground">
            {sessionId ? `Sesión activa: ${sessionId}` : "Sin sesión activa"}
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          {!sessionId && (
            <Button 
              variant="outline" 
              size="lg"
              onClick={generateSessionId}
            >
              Generar Código de Sesión
            </Button>
          )}
          
          {sessionId && !isRecording && (
            <Button
              variant="default"
              size="lg"
              className="bg-medivoz-500 hover:bg-medivoz-600"
              onClick={handleStartRecording}
            >
              <Play className="mr-2 h-5 w-5" />
              Iniciar Grabación
            </Button>
          )}
          
          {isRecording && (
            <Button
              variant="destructive"
              size="lg"
              onClick={handleStopRecording}
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
    </Card>
  );
}
