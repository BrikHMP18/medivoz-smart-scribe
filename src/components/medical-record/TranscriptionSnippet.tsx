
import { FilePen } from "lucide-react";

interface TranscriptionSnippetProps {
  transcriptionSnippet: string;
}

export function TranscriptionSnippet({ transcriptionSnippet }: TranscriptionSnippetProps) {
  if (!transcriptionSnippet) return null;
  
  return (
    <div className="bg-muted p-3 rounded-md mb-4 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <FilePen className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium">Fragmento de la transcripción:</h4>
      </div>
      <p className="text-muted-foreground">{transcriptionSnippet}</p>
    </div>
  );
}
