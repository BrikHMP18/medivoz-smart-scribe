
import React from "react";
import { useAgents } from "@/contexts/AgentsContext";
import { AgentCard } from "./AgentCard";
import { Agent } from "@/types/agents";

export function AgentsList() {
  const { agents } = useAgents();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent: Agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
