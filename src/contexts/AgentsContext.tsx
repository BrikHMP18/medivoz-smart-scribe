import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Agent } from "@/types/agents";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

// Default agents seeded for new doctors
const defaultAgents: Omit<Agent, "id">[] = [
  {
    nombre: "Transcriptor",
    descripcion: "Convierte la consulta médico-paciente en texto estructurado, preservando terminología neurológica y voces.",
    tipo: "Transcriptor",
    estado: "activo",
    prompt: `Eres un sistema de transcripción médica especializada en neurología, diseñado específicamente para el Hospital Nacional Edgardo Rebagliati Martins de EsSalud en Lima, Perú. Tu función es convertir con precisión la grabación de voz de la interacción médico-paciente en texto médico estructurado en tiempo real.

OBJETIVOS:
- Transcribir con alta fidelidad y precisión el diálogo médico-paciente
- Preservar la terminología médica neurológica especializada
- Mantener la estructura natural de la conversación clínica
- Identificar y diferenciar las voces del médico y del paciente

INSTRUCCIONES ESPECÍFICAS:
1. Mantén la terminología médica neurológica intacta (no simplificar términos técnicos)
2. Captura con precisión valores numéricos, dosis de medicamentos y fechas
3. Transcribe literalmente los síntomas descritos por el paciente (preservando sus palabras exactas cuando sea relevante)
4. Cuando el paciente describa síntomas, preserva su descripción entre comillas
5. Identifica y marca claramente quién está hablando (médico vs. paciente/familiar)
6. Omite conversaciones no relevantes para la consulta médica
7. Preserva el español peruano y modismos locales relevantes para la comprensión clínica
8. Mantén la estructura cronológica de la conversación

FORMATO DE LA TRANSCRIPCIÓN:
- MÉDICO: [Transcripción de lo dicho por el médico]
- PACIENTE: [Transcripción de lo dicho por el paciente]
- FAMILIAR: [Transcripción de lo dicho por el familiar/acompañante]

ADAPTACIONES ESPECÍFICAS:
1. Interpreta correctamente acentos y modismos peruanos
2. Reconoce nombres de medicamentos comerciales usados en Perú
3. Mantén abreviaturas médicas estándar (ej. HTA, DM2, ACV)
4. Para valores de laboratorio, mantén las unidades de medida exactas
5. Identifica cuando el médico está dictando directamente hallazgos del examen físico

La transcripción debe ser completa, precisa y organizada, preparada para ser procesada por el siguiente componente del sistema (Extractor de Síntomas).`,
    documentos: ["Guía de transcripción médica.pdf", "Términos médicos comunes.doc"],
    dependencias: [],
    configuracion: {
      modelo: "gpt-4o",
      temperatura: 0.2,
      identificaVoces: true,
      preservaTerminologia: true,
      flujoAutomatico: true
    }
  },
  {
    nombre: "Extractor de Síntomas",
    descripcion: "Extrae información neurológica relevante y la estructura en formato SOAP (S).",
    tipo: "Extractor",
    estado: "activo",
    prompt: `Eres un sistema especializado en extracción de información clínica neurológica para el Hospital Nacional Edgardo Rebagliati Martins. Tu función es analizar la transcripción de la consulta médica e identificar sistemáticamente todos los elementos clínicamente relevantes para estructurarlos según el formato SOAP, centrándote específicamente en la sección S (Subjetivo).

OBJETIVOS:
- Extraer con precisión síntomas y antecedentes
- Estructurar la información según el modelo SOAP estándar del hospital
- Priorizar información clínicamente relevante
- Generar un documento conciso pero completo

INSTRUCCIONES PARA EXTRACCIÓN:

PARA LA SECCIÓN SUBJETIVO (S):
1. Identifica y extrae:
   - Motivo de consulta (usar comillas para las palabras textuales del paciente, en 1 frase u oración)
   - Síntomas principales: Usar solo lenguaje medico semiológico, cada síntoma en 1 o 2 palabras
   - Tiempo de enfermedad (expresado en días/semanas/meses/años)
   - Forma de inicio (súbito/brusco/gradual/insidioso)
   - Curso de la enfermedad (progresivo/estacionario/regresivo)
   - Historia cronológica de la enfermedad actual, priorizando:
     * Características específicas de los síntomas principales
     * Factores exacerbantes y atenuantes
     * Síntomas asociados
     * Tratamientos previos y respuesta

   IMPORTANTE: Redacta toda la información en tercera persona, como una historia clínica profesional. Solo el motivo de consulta debe incluir las palabras textuales del paciente entre comillas. El resto debe narrarse objetivamente (ejemplo: "Refiere cefalea de inicio súbito" en lugar de "Tengo dolor de cabeza desde ayer").

2. Extrae antecedentes relevantes:
   - Patológicos (enfermedades crónicas con fecha de diagnóstico)
   - Farmacológicos (medicación actual con dosis y frecuencia)
   - Epidemiológicos relevantes (enfermedades de la zona geográfica donde vive el paciente)
   - Hábitos nocivos
   - Antecedentes médicos familiares
   - Reacciones adversas
   - Estado funcional basal: Precisar si es "autosuficiente" (se vale por si mismo en todas sus actividades diarias), dependiente parcial (si necesita de ayuda por terceras personas para realizar algunas actividades diarias) o dependiente total (si necesita ayuda absolutamente para todas sus actividades diarias).

3. Incluye resultados de estudios recientes mencionados en la consulta

REGLAS DE FORMATO:
1. Usa lenguaje técnico neurológico apropiado
2. Resume manteniendo información clínicamente relevante
3. Estructura de forma clara con párrafos cortos
4. Incluye solo hallazgos positivos y negativos relevantes
5. Omite redundancias y conversaciones no clínicas
6. Preserva valores numéricos exactos (escalas, mediciones)

El resultado debe ser un texto estructurado, conciso y completo que capture los elementos esenciales de la sección S del formato SOAP.`,
    documentos: ["Manual de extracción clínica.pdf", "Taxonomía de síntomas.xlsx"],
    dependencias: [],
    configuracion: {
      modelo: "gpt-4o",
      temperatura: 0.2,
      formatoSalida: "json"
    }
  },
];

type AgentsContextValue = {
  agents: Agent[];
  loading: boolean;
  getAgentById: (id: string) => Agent | undefined;
  updateAgent: (updatedAgent: Agent) => Promise<void>;
  addAgent: (agent: Omit<Agent, "id">) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  reorderAgents: (newOrderIds: string[]) => void;
};

const AgentsContext = createContext<AgentsContextValue | undefined>(undefined);

export const AgentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch agents from Supabase
  const fetchAgents = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setAgents(data.map(mapDbToAgent));
      } else {
        // Seed default agents for new doctors
        await seedDefaultAgents(user.id);
      }
    } catch (error) {
      logger.error("Error fetching agents:", error);
      toast.error("Error al cargar los agentes");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const seedDefaultAgents = async (doctorId: string) => {
    try {
      // Double-check to avoid race conditions (React StrictMode double-mount)
      const { count } = await supabase
        .from("agents")
        .select("id", { count: "exact", head: true })
        .eq("doctor_id", doctorId);

      if (count && count > 0) {
        // Already seeded — just refetch
        await fetchAgents();
        return;
      }

      const inserts = defaultAgents.map((agent) => ({
        doctor_id: doctorId,
        nombre: agent.nombre,
        descripcion: agent.descripcion,
        tipo: agent.tipo,
        estado: agent.estado,
        prompt: agent.prompt || null,
        documentos: agent.documentos || [],
        dependencias: agent.dependencias || [],
        configuracion: agent.configuracion || {},
      }));

      const { data, error } = await supabase
        .from("agents")
        .insert(inserts)
        .select();

      if (error) throw error;

      if (data) {
        setAgents(data.map(mapDbToAgent));
      }
    } catch (error) {
      logger.error("Error seeding default agents:", error);
    }
  };

  const getAgentById = (id: string) => {
    return agents.find((agent) => agent.id === id);
  };

  const updateAgent = async (updatedAgent: Agent) => {
    try {
      const { error } = await supabase
        .from("agents")
        .update({
          nombre: updatedAgent.nombre,
          descripcion: updatedAgent.descripcion,
          tipo: updatedAgent.tipo,
          estado: updatedAgent.estado,
          prompt: updatedAgent.prompt || null,
          documentos: updatedAgent.documentos || [],
          dependencias: updatedAgent.dependencias || [],
          configuracion: updatedAgent.configuracion || {},
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedAgent.id);

      if (error) throw error;

      setAgents((prev) =>
        prev.map((agent) => (agent.id === updatedAgent.id ? updatedAgent : agent))
      );
      toast.success("Agente actualizado correctamente");
    } catch (error) {
      logger.error("Error updating agent:", error);
      toast.error("Error al actualizar el agente");
    }
  };

  const addAgent = async (agent: Omit<Agent, "id">) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("agents")
        .insert({
          doctor_id: user.id,
          nombre: agent.nombre,
          descripcion: agent.descripcion,
          tipo: agent.tipo,
          estado: agent.estado,
          prompt: agent.prompt || null,
          documentos: agent.documentos || [],
          dependencias: agent.dependencias || [],
          configuracion: agent.configuracion || {},
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setAgents((prev) => [...prev, mapDbToAgent(data)]);
        toast.success("Agente creado correctamente");
      }
    } catch (error) {
      logger.error("Error adding agent:", error);
      toast.error("Error al crear el agente");
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const { error } = await supabase.from("agents").delete().eq("id", id);

      if (error) throw error;

      setAgents((prev) => prev.filter((agent) => agent.id !== id));
      toast.success("Agente eliminado");
    } catch (error) {
      logger.error("Error deleting agent:", error);
      toast.error("Error al eliminar el agente");
    }
  };

  const reorderAgents = (newOrderIds: string[]) => {
    const reorderedAgents = newOrderIds
      .map((id) => agents.find((agent) => agent.id === id))
      .filter((a): a is Agent => !!a);
    setAgents(reorderedAgents);
  };

  const value = {
    agents,
    loading,
    getAgentById,
    updateAgent,
    addAgent,
    deleteAgent,
    reorderAgents,
  };

  return <AgentsContext.Provider value={value}>{children}</AgentsContext.Provider>;
};

export const useAgents = () => {
  const context = useContext(AgentsContext);
  if (context === undefined) {
    throw new Error("useAgents must be used within an AgentsProvider");
  }
  return context;
};

// Map DB row to Agent interface
function mapDbToAgent(row: Record<string, unknown>): Agent {
  return {
    id: row.id as string,
    nombre: row.nombre as string,
    descripcion: row.descripcion as string,
    tipo: row.tipo as Agent["tipo"],
    estado: row.estado as Agent["estado"],
    prompt: (row.prompt as string) || undefined,
    documentos: (row.documentos as string[]) || undefined,
    dependencias: (row.dependencias as string[]) || undefined,
    configuracion: (row.configuracion as Record<string, unknown>) || undefined,
  };
}
