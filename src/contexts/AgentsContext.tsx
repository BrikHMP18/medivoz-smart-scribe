
import React, { createContext, useContext, useState, useEffect } from "react";
import { Agent } from "@/types/agents";

// Datos iniciales simulados
const initialAgents: Agent[] = [
  {
    id: "1",
    nombre: "Transcriptor",
    descripcion: "Convierte la grabación de voz en texto médico en tiempo real.",
    tipo: "Transcriptor",
    estado: "activo",
    prompt: "Transcribe el siguiente audio médico a texto, manteniendo términos técnicos y estructura de la conversación...",
    documentos: ["Guía de transcripción médica.pdf", "Términos médicos comunes.doc"],
    dependencias: [],
    configuracion: {
      modelo: "gpt-4o",
      temperatura: 0.3,
      flujoAutomatico: true
    }
  },
  {
    id: "2",
    nombre: "Extractor de Síntomas",
    descripcion: "Identifica síntomas y antecedentes desde la transcripción.",
    tipo: "Extractor",
    estado: "activo",
    prompt: "Extrae todos los síntomas, antecedentes médicos y datos clínicos relevantes del siguiente texto...",
    documentos: ["Manual de extracción clínica.pdf", "Taxonomía de síntomas.xlsx"],
    dependencias: ["1"],
    configuracion: {
      modelo: "gpt-4o",
      temperatura: 0.2,
      formatoSalida: "json"
    }
  },
  {
    id: "3",
    nombre: "Agente Diagnóstico",
    descripcion: "Sugiere un diagnóstico clínico basado en el contenido de la ficha.",
    tipo: "Diagnóstico",
    estado: "activo",
    prompt: "Basado en los siguientes síntomas y antecedentes médicos, sugiere posibles diagnósticos clínicos...",
    documentos: ["Guía de diagnóstico clínico.pdf", "CIE-10 Referencias.pdf"],
    dependencias: ["2"],
    configuracion: {
      modelo: "gpt-4o",
      temperatura: 0.1,
      incluyeReferencias: true
    }
  },
  {
    id: "4",
    nombre: "Agente de Tratamiento",
    descripcion: "Propone tratamientos y medidas médicas personalizadas.",
    tipo: "Tratamiento",
    estado: "activo",
    prompt: "Para el siguiente diagnóstico y perfil de paciente, sugiere un plan de tratamiento adecuado...",
    documentos: ["Vademecum actualizado.pdf", "Protocolos de tratamiento.doc"],
    dependencias: ["3"],
    configuracion: {
      modelo: "gpt-4o",
      temperatura: 0.2,
      incluyeFarmacos: true
    }
  }
];

type AgentsContextValue = {
  agents: Agent[];
  getAgentById: (id: string) => Agent | undefined;
  updateAgent: (updatedAgent: Agent) => void;
  addAgent: (agent: Omit<Agent, "id">) => void;
  deleteAgent: (id: string) => void;
  reorderAgents: (newOrderIds: string[]) => void;
};

const AgentsContext = createContext<AgentsContextValue | undefined>(undefined);

export const AgentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);

  const getAgentById = (id: string) => {
    return agents.find(agent => agent.id === id);
  };

  const updateAgent = (updatedAgent: Agent) => {
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === updatedAgent.id ? updatedAgent : agent
      )
    );
  };

  const addAgent = (agent: Omit<Agent, "id">) => {
    const newId = (Math.max(...agents.map(a => parseInt(a.id)), 0) + 1).toString();
    setAgents(prevAgents => [...prevAgents, { ...agent, id: newId }]);
  };

  const deleteAgent = (id: string) => {
    setAgents(prevAgents => prevAgents.filter(agent => agent.id !== id));
  };

  const reorderAgents = (newOrderIds: string[]) => {
    const reorderedAgents = newOrderIds.map(id => agents.find(agent => agent.id === id)!);
    setAgents(reorderedAgents);
  };

  const value = {
    agents,
    getAgentById,
    updateAgent,
    addAgent,
    deleteAgent,
    reorderAgents
  };

  return (
    <AgentsContext.Provider value={value}>
      {children}
    </AgentsContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentsContext);
  if (context === undefined) {
    throw new Error("useAgents must be used within an AgentsProvider");
  }
  return context;
};
