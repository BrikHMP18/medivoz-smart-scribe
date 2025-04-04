
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { MedicalRecordModal } from "./MedicalRecordModal";

interface TranscriptionProps {
  transcription: string;
  patientId?: string | null;
  sessionId?: string | null;
}

export function Transcription({ transcription, patientId, sessionId }: TranscriptionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (!transcription) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center p-6 md:p-12">
          <FileText className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 text-essalud-light opacity-50" />
          <h3 className="text-lg font-medium text-muted-foreground">Sin transcripción</h3>
          <p className="text-sm text-muted-foreground/70 mt-2 max-w-md mx-auto">
            Inicia una grabación para generar la transcripción de la consulta médica.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#3DB7E4]/10">
          <CardTitle className="text-lg md:text-xl text-essalud-blue">Transcripción</CardTitle>
          <Button 
            onClick={() => setIsModalOpen(true)}
            disabled={!sessionId || !patientId}
            size="sm"
            className="text-sm"
          >
            Llenar Ficha Médica
          </Button>
        </CardHeader>
        <CardContent className="overflow-auto flex-grow p-4">
          <div className="space-y-4 whitespace-pre-line text-sm md:text-base">
            {transcription}
          </div>
        </CardContent>
      </Card>
      
      <MedicalRecordModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        patientId={patientId}
        sessionId={sessionId}
      />
    </>
  );
}
