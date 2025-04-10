
import React, { useState } from "react";
import { useAgents } from "@/contexts/AgentsContext";
import { Agent } from "@/types/agents";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  GitFork, 
  Save, 
  Settings, 
  Trash2, 
  AlertTriangle, 
  Play 
} from "lucide-react";
import { toast } from "sonner";
import { AgentFlow } from "./AgentFlow";

interface AgentFormProps {
  agentId: string;
}

export function AgentForm({ agentId }: AgentFormProps) {
  const { getAgentById, updateAgent, agents } = useAgents();
  const agent = getAgentById(agentId);
  
  const [formData, setFormData] = useState<Agent | undefined>(agent);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [isTesting, setIsTesting] = useState(false);

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

  // Filtrar agentes que podrían ser dependencias (evitar loops)
  const possibleDependencies = agents.filter(a => a.id !== agentId);

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

      <Tabs defaultValue="prompt">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 mb-6">
          <TabsTrigger value="prompt">Prompt Base</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencias</TabsTrigger>
          <TabsTrigger value="test">Zona de Pruebas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prompt" className="space-y-6">
          <div className="grid gap-6">
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
              <Label>Prompt Base</Label>
              <Textarea 
                value={formData.prompt || ''} 
                onChange={e => handleInputChange('prompt', e.target.value)} 
                rows={12}
                placeholder="Ingrese el prompt base que el agente utilizará..."
                className="font-mono text-sm"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="config" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuración Técnica
                </CardTitle>
                <CardDescription>
                  Parámetros técnicos del agente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="incluir-ref">Incluir Referencias</Label>
                  <Switch 
                    id="incluir-ref" 
                    checked={formData.configuracion?.incluyeReferencias || false}
                    onCheckedChange={v => handleConfigChange('incluyeReferencias', v)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
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
          </div>
        </TabsContent>
        
        <TabsContent value="dependencies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitFork className="h-5 w-5 mr-2" />
                Dependencias
              </CardTitle>
              <CardDescription>
                Agentes de los que depende este agente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Agentes conectados</Label>
                <div className="flex flex-wrap gap-2 py-2">
                  {formData.dependencias && formData.dependencias.length > 0 ? (
                    formData.dependencias.map(depId => {
                      const dep = getAgentById(depId);
                      return dep ? (
                        <Badge key={depId} variant="secondary" className="py-1">
                          {dep.nombre}
                        </Badge>
                      ) : null;
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">Este agente no depende de otros agentes</p>
                  )}
                </div>
                <div className="mt-4">
                  <Label>Agregar dependencia</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar agente" />
                    </SelectTrigger>
                    <SelectContent>
                      {possibleDependencies.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="mb-3 font-medium">Visualización de Flujo</h4>
                <AgentFlow readOnly />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2" />
                Zona de Prueba
              </CardTitle>
              <CardDescription>
                Pruebe el funcionamiento del agente con texto de ejemplo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
