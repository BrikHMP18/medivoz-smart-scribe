
import React from "react";
import { AgentsProvider } from "@/contexts/AgentsContext";
import { AgentsHeader } from "@/components/agents/AgentsHeader";
import { AgentsList } from "@/components/agents/AgentsList";
import { Sidebar } from "@/components/layout/Sidebar";
import { AgentFlow } from "@/components/agents/AgentFlow";

export default function Agents() {
  return (
    <AgentsProvider>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-6">
          <AgentsHeader />
          <AgentsList />
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Orquestación de Agentes</h2>
            <AgentFlow readOnly={true} />
          </div>
        </div>
      </div>
    </AgentsProvider>
  );
}
