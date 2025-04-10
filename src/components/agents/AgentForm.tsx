
import React, { useState } from "react";
import { useAgents } from "@/contexts/AgentsContext";
import { Agent } from "@/types/agents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, FileText, BookOpen, Save, Settings, Trash2, Play, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AgentBasicInfo } from "./AgentBasicInfo";
import { AgentPromptEditor } from "./AgentPromptEditor";
import { AgentDocuments } from "./AgentDocuments";
import { AgentConfiguration } from "./AgentConfiguration";
import { AgentTestArea } from "./AgentTestArea";

interface AgentFormProps {
  agentId: string;
}

export function AgentForm({ agentId }: AgentFormProps) {
  const { getAgentById, updateAgent } = useAgents();
  const agent = getAgentById(agentId);
  
  const [formData, setFormData] = useState<Agent | undefined>(agent);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);

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
    <div className="space-y-6">
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

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Información principal del agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgentBasicInfo agent={formData} onInputChange={handleInputChange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Prompt Base
            </CardTitle>
            <CardDescription>
              Instrucciones base que definen el comportamiento del agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgentPromptEditor 
              prompt={formData.prompt} 
              onChange={(value) => handleInputChange('prompt', value)} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Documentos Relacionados
            </CardTitle>
            <CardDescription>
              Archivos y referencias utilizados por este agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgentDocuments documents={formData.documentos} />
          </CardContent>
        </Card>

        <Collapsible 
          open={isConfigOpen} 
          onOpenChange={setIsConfigOpen}
          className="border rounded-lg"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex w-full justify-between p-6 rounded-lg"
            >
              <div className="flex items-center text-left font-medium">
                <Settings className="h-5 w-5 mr-2" />
                Configuración Técnica
              </div>
              {isConfigOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-6 pb-6">
            <AgentConfiguration 
              config={formData.configuracion} 
              onConfigChange={handleConfigChange} 
            />
          </CollapsibleContent>
        </Collapsible>

        <Collapsible 
          open={isTestOpen} 
          onOpenChange={setIsTestOpen}
          className="border rounded-lg"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex w-full justify-between p-6 rounded-lg"
            >
              <div className="flex items-center text-left font-medium">
                <Play className="h-5 w-5 mr-2" />
                Zona de Pruebas
              </div>
              {isTestOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-6 pb-6">
            <AgentTestArea agent={formData} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
