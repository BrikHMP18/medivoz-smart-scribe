
import React, { useState } from "react";
import { useAgents } from "@/contexts/AgentsContext";
import { Agent } from "@/types/agents";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, BookOpen, Save, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { AgentBasicInfo } from "./AgentBasicInfo";
import { AgentPromptEditor } from "./AgentPromptEditor";
import { AgentDocuments } from "./AgentDocuments";
import { AgentConfiguration } from "./AgentConfiguration";

interface AgentFormProps {
  agentId: string;
}

export function AgentForm({ agentId }: AgentFormProps) {
  const { getAgentById, updateAgent } = useAgents();
  const agent = getAgentById(agentId);
  
  const [formData, setFormData] = useState<Agent | undefined>(agent);

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold">Agente no encontrado</h2>
          <p className="text-muted-foreground">
            No se encontró un agente con el ID: {agentId}
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof Agent, value: any) => {
    setFormData(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    setFormData(prev => {
      if (!prev) return prev;
      return { 
        ...prev, 
        configuracion: { 
          ...(prev.configuracion || {}), 
          [key]: value 
        } 
      };
    });
  };

  const handleSave = () => {
    if (formData) {
      updateAgent(formData);
      toast.success("Agente actualizado correctamente");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{formData.nombre}</h1>
          <p className="text-muted-foreground">{formData.descripcion}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Información Básica</h2>
          </div>
          <Separator className="mb-4" />
          <AgentBasicInfo agent={formData} onInputChange={handleInputChange} />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Prompt Base</h2>
          </div>
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Instrucciones base que definen el comportamiento del agente
          </p>
          <AgentPromptEditor 
            prompt={formData.prompt} 
            onChange={(value) => handleInputChange('prompt', value)} 
          />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Documentos Relacionados</h2>
          </div>
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Archivos y referencias utilizados por este agente
          </p>
          <AgentDocuments documents={formData.documentos} />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Configuración Técnica</h2>
          </div>
          <Separator className="mb-4" />
          <AgentConfiguration 
            config={formData.configuracion} 
            onConfigChange={handleConfigChange} 
          />
        </section>
      </div>
    </div>
  );
}
