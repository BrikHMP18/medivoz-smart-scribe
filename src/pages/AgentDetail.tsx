
import React from "react";
import { useParams } from "react-router-dom";
import { AgentsProvider } from "@/contexts/AgentsContext";
import { AgentForm } from "@/components/agents/AgentForm";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <AgentsProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto pl-16 lg:pl-60 py-8 px-4 md:px-8">
          <AgentForm agentId={id || ""} />
        </div>
      </div>
    </AgentsProvider>
  );
}
