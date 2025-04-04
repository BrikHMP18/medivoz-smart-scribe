
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
        <div className="text-center p-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-muted-foreground">Sin transcripción</h3>
          <p className="text-sm text-muted-foreground/70 mt-2 max-w-md">
            Inicia una grabación para generar la transcripción de la consulta médica.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Transcripción</CardTitle>
          <Button 
            onClick={() => setIsModalOpen(true)}
            disabled={!sessionId || !patientId}
          >
            Llenar Ficha Médica
          </Button>
        </CardHeader>
        <CardContent className="overflow-auto flex-grow">
          <div className="space-y-4 whitespace-pre-line font-medium">
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
