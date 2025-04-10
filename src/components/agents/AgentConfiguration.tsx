
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface AgentConfigurationProps {
  config: Record<string, any> | undefined;
  onConfigChange: (key: string, value: any) => void;
}

export function AgentConfiguration({ config, onConfigChange }: AgentConfigurationProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Modelo de IA</Label>
        <Select 
          value={config?.modelo || "gpt-4o"} 
          onValueChange={v => onConfigChange('modelo', v)}
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
          value={config?.temperatura?.toString() || "0.7"} 
          onValueChange={v => onConfigChange('temperatura', parseFloat(v))}
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
          checked={config?.flujoAutomatico || false}
          onCheckedChange={v => onConfigChange('flujoAutomatico', v)}
        />
      </div>
    </div>
  );
}
