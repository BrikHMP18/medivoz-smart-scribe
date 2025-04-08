
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoaderCircle, Sparkles } from "lucide-react";
import { TranscriptionSnippet } from "../medical-record/TranscriptionSnippet";

interface TranscriptionPanelProps {
  transcriptionSnippet: string;
  fullTranscription: string;
  showFullTranscription: boolean;
  onToggleTranscription: () => void;
  onAutoFill: () => void;
  isAutoFilling: boolean;
}

export function TranscriptionPanel({
  transcriptionSnippet,
  fullTranscription,
  showFullTranscription,
  onToggleTranscription,
  onAutoFill,
  isAutoFilling
}: TranscriptionPanelProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-2 mt-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          Transcripción de la consulta
          <Badge variant="outline" className="text-xs ml-2 bg-muted/50">
            {(fullTranscription?.length || 0).toLocaleString()} caracteres
          </Badge>
        </h3>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onAutoFill}
          disabled={isAutoFilling || !fullTranscription}
          className="flex items-center gap-1 text-xs h-8 bg-primary/5 hover:bg-primary/10 border-primary/20"
        >
          {isAutoFilling ? (
            <>
              <LoaderCircle className="h-3.5 w-3.5 animate-spin mr-1" />
              Procesando...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Auto-rellenar con IA
            </>
          )}
        </Button>
      </div>

      <TranscriptionSnippet 
        transcriptionSnippet={transcriptionSnippet}
        fullTranscription={fullTranscription}
        showFullTranscription={showFullTranscription}
        onToggleTranscription={onToggleTranscription}
      />
    </>
  );
}
