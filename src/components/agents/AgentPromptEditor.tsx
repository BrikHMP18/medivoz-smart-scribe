
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AgentPromptEditorProps {
  prompt: string | undefined;
  onChange: (value: string) => void;
}

export function AgentPromptEditor({ prompt, onChange }: AgentPromptEditorProps) {
  return (
    <div>
      <Textarea 
        value={prompt || ''} 
        onChange={e => onChange(e.target.value)} 
        rows={8}
        placeholder="Ingrese el prompt base que el agente utilizará..."
        className="font-mono text-sm"
      />
    </div>
  );
}
