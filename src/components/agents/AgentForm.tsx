
import React, { useState } from "react";
import { useAgents } from "@/contexts/AgentsContext";
import { Agent } from "@/types/agents";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  FileText, 
  Save, 
  Settings, 
  Trash2, 
  AlertTriangle, 
  Play,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AgentFormProps {
  agentId: string;
}

export function AgentForm({ agentId }: AgentFormProps) {
  const { getAgentById, updateAgent } = useAgents();
  const agent = getAgentById(agentId);
  
  const [formData, setFormData] = useState<Agent | undefined>(agent);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [isTesting, setIsTesting] = useState(false);
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

  const handleTest = () => {
    setIsTesting(true);
    // Simulación de procesamiento
    setTimeout(() => {
      setTestOutput(`Resultado del procesamiento:\n\nEntrada:\n${testInput}\n\nProcesado con ${formData?.tipo} usando configuración personalizada.\n\nAnálisis completado exitosamente.`);
      setIsTesting(false);
      toast.success("Prueba completada");
    }, 1500);
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Agente</Label>
              <Input 
                value={formData.nombre} 
                onChange={e => handleInputChange('nombre', e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea 
                value={formData.descripcion} 
                onChange={e => handleInputChange('descripcion', e.target.value)} 
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Agente</Label>
              <div className="mt-1">
                <Badge 
                  className={`
                    ${formData.tipo === 'Transcriptor' ? 'bg-blue-500' : ''}
                    ${formData.tipo === 'Extractor' ? 'bg-green-500' : ''}
                    ${formData.tipo === 'Diagnóstico' ? 'bg-purple-500' : ''}
                    ${formData.tipo === 'Tratamiento' ? 'bg-amber-500' : ''}
                  `}
                >
                  {formData.tipo}
                </Badge>
              </div>
            </div>
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
            <Textarea 
              value={formData.prompt || ''} 
              onChange={e => handleInputChange('prompt', e.target.value)} 
              rows={8}
              placeholder="Ingrese el prompt base que el agente utilizará..."
              className="font-mono text-sm"
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
            <div className="space-y-2">
              {formData.documentos && formData.documentos.length > 0 ? (
                <ul className="space-y-2">
                  {formData.documentos.map((doc, index) => (
                    <li key={index} className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No hay documentos asociados</p>
              )}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full">
              Gestionar Documentos
            </Button>
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
          <CollapsibleContent className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <Label>Modelo de IA</Label>
              <Select 
                value={formData.configuracion?.modelo || "gpt-4o"} 
                onValueChange={v => handleConfigChange('modelo', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Temperatura</Label>
              <Select 
                value={formData.configuracion?.temperatura?.toString() || "0.7"} 
                onValueChange={v => handleConfigChange('temperatura', parseFloat(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione temperatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.1">0.1 - Muy determinista</SelectItem>
                  <SelectItem value="0.3">0.3 - Poco creativo</SelectItem>
                  <SelectItem value="0.5">0.5 - Balanceado</SelectItem>
                  <SelectItem value="0.7">0.7 - Creativo</SelectItem>
                  <SelectItem value="1.0">1.0 - Muy creativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="auto-flow">Flujo Automático</Label>
              <Switch 
                id="auto-flow" 
                checked={formData.configuracion?.flujoAutomatico || false}
                onCheckedChange={v => handleConfigChange('flujoAutomatico', v)}
              />
            </div>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Texto de entrada</Label>
                <Textarea 
                  value={testInput} 
                  onChange={e => setTestInput(e.target.value)} 
                  rows={5}
                  placeholder="Ingrese un texto para probar el funcionamiento del agente..."
                />
              </div>
              
              <Button 
                onClick={handleTest} 
                disabled={isTesting || !testInput.trim()} 
                className="w-full"
              >
                {isTesting ? "Procesando..." : "Probar Agente"}
              </Button>
              
              {testOutput && (
                <div className="space-y-2 pt-4">
                  <Label>Resultado</Label>
                  <div className="p-3 bg-muted rounded-md whitespace-pre-wrap font-mono text-sm">
                    {testOutput}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
