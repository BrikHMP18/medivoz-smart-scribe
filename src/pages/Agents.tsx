
import React from "react";
import { AgentsProvider } from "@/contexts/AgentsContext";
import { AgentsHeader } from "@/components/agents/AgentsHeader";
import { AgentsList } from "@/components/agents/AgentsList";
import { Sidebar } from "@/components/layout/Sidebar";
import { AgentFlow } from "@/components/agents/AgentFlow";
import { Separator } from "@/components/ui/separator";

export default function Agents() {
  return (
    <AgentsProvider>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-6 max-w-[1400px] mx-auto">
          <AgentsHeader />
          
          <div className="mt-6">
            <AgentsList />
          </div>
          
          <div className="mt-12">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">Orquestación de Agentes</h2>
              <p className="ml-4 text-sm text-muted-foreground">
                Visualización del flujo de procesamiento entre agentes
              </p>
            </div>
            <Separator className="mb-6" />
            <AgentFlow readOnly={true} />
          </div>
        </div>
      </div>
    </AgentsProvider>
  );
}
