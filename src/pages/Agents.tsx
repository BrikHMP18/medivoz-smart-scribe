import React from "react";
import { AgentsProvider } from "@/contexts/AgentsContext";
import { AgentsHeader } from "@/components/agents/AgentsHeader";
import { AgentsList } from "@/components/agents/AgentsList";
import { Sidebar } from "@/components/layout/Sidebar";
import { AgentFlow } from "@/components/agents/AgentFlow";
import { Separator } from "@/components/ui/separator";
import { BrainCircuit, Share2 } from "lucide-react";

export default function Agents() {
  return (
    <AgentsProvider>
      <div className="flex min-h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 h-screen overflow-auto">
          <div className="w-full max-w-7xl mx-auto px-6 py-12 space-y-12">
            <AgentsHeader />
            
            <section className="space-y-8 animate-fade-in delay-100">
              <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Agentes Activos</h2>
                  <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
                    Gestiona los agentes de inteligencia artificial que procesan tus consultas médicas.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto place-items-center w-full">
                 <AgentsList />
              </div>
            </section>
            
            <Separator className="max-w-4xl mx-auto bg-border/40" />
            
            <section className="space-y-8 animate-fade-in delay-200 pb-10">
              <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Share2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Orquestación de Flujo</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Visualización del flujo de datos entre los agentes durante el procesamiento de una consulta.
                  </p>
                </div>
              </div>
              
              <div className="rounded-2xl border border-border bg-card shadow-sm p-1 overflow-hidden max-w-4xl mx-auto w-full">
                <div className="bg-muted/30 rounded-xl overflow-hidden h-[500px] relative group">
                   <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                   <AgentFlow readOnly={true} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AgentsProvider>
  );
}
