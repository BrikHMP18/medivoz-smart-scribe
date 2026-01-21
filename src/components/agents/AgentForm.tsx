import React, { useState } from "react";
import { useAgents } from "@/contexts/AgentsContext";
import { Agent } from "@/types/agents";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, BookOpen, Save, Settings } from "lucide-react";
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
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">{formData.nombre}</h1>
          <p className="text-muted-foreground mt-1">{formData.descripcion}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="shadow-md hover:shadow-lg transition-all">
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Información Básica</h2>
          </div>
          <Separator className="mb-6" />
          <AgentBasicInfo agent={formData} onInputChange={handleInputChange} />
        </section>

        <section className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Prompt Base</h2>
          </div>
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground mb-6 bg-muted/50 p-3 rounded-lg border border-border/50">
            Instrucciones base que definen el comportamiento y la personalidad del agente durante el procesamiento.
          </p>
          <AgentPromptEditor 
            prompt={formData.prompt} 
            onChange={(value) => handleInputChange('prompt', value)} 
          />
        </section>

        <section className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Documentos Relacionados</h2>
          </div>
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground mb-6 bg-muted/50 p-3 rounded-lg border border-border/50">
            Archivos de referencia y bases de conocimiento que el agente utiliza para contextualizar sus respuestas.
          </p>
          <AgentDocuments documents={formData.documentos} />
        </section>

        <section className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Configuración Técnica</h2>
          </div>
          <Separator className="mb-6" />
          <AgentConfiguration 
            config={formData.configuracion} 
            onConfigChange={handleConfigChange} 
          />
        </section>
      </div>
    </div>
  );
}
