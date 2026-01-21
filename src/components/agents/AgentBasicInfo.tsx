
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Agent } from "@/types/agents";

const typeBadgeClasses: Record<string, string> = {
  Transcriptor: "bg-blue-500",
  Extractor: "bg-green-500"
};

interface AgentBasicInfoProps {
  agent: Agent;
  onInputChange: (field: keyof Agent, value: any) => void;
}

export function AgentBasicInfo({ agent, onInputChange }: AgentBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre del Agente</Label>
        <Input 
          value={agent.nombre} 
          onChange={e => onInputChange('nombre', e.target.value)} 
        />
      </div>
      
      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea 
          value={agent.descripcion} 
          onChange={e => onInputChange('descripcion', e.target.value)} 
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Tipo de Agente</Label>
        <div className="mt-1">
          <Badge className={typeBadgeClasses[agent.tipo] ?? "bg-muted text-muted-foreground"}>
            {agent.tipo}
          </Badge>
        </div>
      </div>
    </div>
  );
}
