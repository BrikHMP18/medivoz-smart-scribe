
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SessionRecorder } from "@/components/SessionRecorder";
import { Transcription } from "@/components/Transcription";

export default function Session() {
  const [transcription, setTranscription] = useState("");

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-64">
        <div className="container py-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Sesión de Consulta</h1>
            <p className="text-muted-foreground">
              Grabe y transcriba automáticamente su consulta médica
            </p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SessionRecorder onTranscriptionReady={setTranscription} />
          </div>
          
          <div className="min-h-[500px] mb-6">
            <Transcription transcription={transcription} />
          </div>
        </div>
      </div>
    </div>
  );
}
