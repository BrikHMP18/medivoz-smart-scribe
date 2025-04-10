
import React from "react";
import { AgentsProvider } from "@/contexts/AgentsContext";
import { AgentsHeader } from "@/components/agents/AgentsHeader";
import { AgentsList } from "@/components/agents/AgentsList";
import { Sidebar } from "@/components/layout/Sidebar";

export default function Agents() {
  return (
    <AgentsProvider>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-6">
          <AgentsHeader />
          <AgentsList />
        </div>
      </div>
    </AgentsProvider>
  );
}
