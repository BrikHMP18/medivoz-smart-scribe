
import React from "react";
import { useParams } from "react-router-dom";
import { AgentsProvider } from "@/contexts/AgentsContext";
import { AgentForm } from "@/components/agents/AgentForm";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <AgentsProvider>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-6">
          <AgentForm agentId={id || ""} />
        </div>
      </div>
    </AgentsProvider>
  );
}
