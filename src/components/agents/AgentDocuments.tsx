
import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface AgentDocumentsProps {
  documents: string[] | undefined;
}

export function AgentDocuments({ documents }: AgentDocumentsProps) {
  return (
    <div className="space-y-2">
      {documents && documents.length > 0 ? (
        <ul className="space-y-2">
          {documents.map((doc, index) => (
            <li key={index} className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No hay documentos asociados</p>
      )}
      <Button variant="outline" size="sm" className="mt-4 w-full">
        Gestionar Documentos
      </Button>
    </div>
  );
}
