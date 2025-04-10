
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Agent } from "@/types/agents";
import { Link } from "react-router-dom";
import { Edit, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const agentTypeColors = {
  "Transcriptor": "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  "Extractor": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  "Diagnóstico": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
  "Tratamiento": "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100"
};

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={cn("font-medium", agentTypeColors[agent.tipo])}>
            {agent.tipo}
          </Badge>
          <Badge variant={agent.estado === "activo" ? "default" : "outline"} className={agent.estado === "activo" ? "bg-green-500" : "text-gray-500"}>
            {agent.estado === "activo" ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <CardTitle className="text-xl mt-2">{agent.nombre}</CardTitle>
        <CardDescription className="line-clamp-2">{agent.descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground">
          {agent.dependencias && agent.dependencias.length > 0 ? (
            <p>{agent.dependencias.length} dependencia{agent.dependencias.length !== 1 ? 's' : ''}</p>
          ) : (
            <p>Sin dependencias</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/agents/${agent.id}`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
        <Button size="sm" variant="secondary">
          <Play className="h-4 w-4 mr-2" />
          Probar
        </Button>
      </CardFooter>
    </Card>
  );
}
