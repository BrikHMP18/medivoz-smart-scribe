
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SessionRecorder } from "@/components/SessionRecorder";
import { Transcription } from "@/components/Transcription";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Session() {
  const [transcription, setTranscription] = useState("");
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-64">
        <div className="container mx-auto py-6 px-4 md:px-6">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Sesión de Consulta</h1>
            <p className="text-muted-foreground">
              Grabe y transcriba automáticamente su consulta médica
            </p>
          </header>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <SessionRecorder onTranscriptionReady={setTranscription} />
          </div>
          
          <div className="min-h-[300px] md:min-h-[500px] mb-6">
            <Transcription transcription={transcription} />
          </div>
        </div>
      </div>
    </div>
  );
}
