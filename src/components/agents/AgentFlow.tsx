
import React, { useCallback, useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { Agent } from "@/types/agents";
import { useAgents } from "@/contexts/AgentsContext";

interface AgentFlowProps {
  readOnly?: boolean;
}

const nodeColors = {
  "Transcriptor": "#3B82F6",
  "Extractor": "#10B981",
  "Diagnóstico": "#8B5CF6",
  "Tratamiento": "#F59E0B"
};

export function AgentFlow({ readOnly = false }: AgentFlowProps) {
  const { agents } = useAgents();
  
  // Crear nodos a partir de los agentes
  const initialNodes: Node[] = useMemo(() => {
    return agents.map((agent, index) => ({
      id: agent.id,
      data: { label: agent.nombre, type: agent.tipo },
      position: { 
        x: 250 * index, 
        y: 100 
      },
      style: { 
        background: nodeColors[agent.tipo],
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '10px',
        width: 180
      }
    }));
  }, [agents]);

  // Crear conexiones basadas en las dependencias
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    agents.forEach(agent => {
      if (agent.dependencias && agent.dependencias.length > 0) {
        agent.dependencias.forEach(depId => {
          edges.push({
            id: `e${depId}-${agent.id}`,
            source: depId,
            target: agent.id,
            animated: true,
            style: { stroke: '#3DB7E4' }
          });
        });
      }
    });
    
    return edges;
  }, [agents]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  return (
    <div className="border rounded-lg w-full h-[400px] bg-sidebar dark:bg-background/80">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        fitView
        panOnScroll
        selectionOnDrag={!readOnly}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        className="bg-sidebar dark:bg-background/80"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap 
          nodeStrokeColor={(n) => nodeColors[n.data.type] || '#eee'} 
          nodeColor={(n) => nodeColors[n.data.type] || '#eee'} 
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
