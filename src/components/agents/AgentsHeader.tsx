
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AgentsHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agentes Inteligentes</h1>
        <p className="text-muted-foreground">
          Gestione los agentes de IA que procesan la información clínica
        </p>
      </div>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Agente
      </Button>
    </div>
  );
}
