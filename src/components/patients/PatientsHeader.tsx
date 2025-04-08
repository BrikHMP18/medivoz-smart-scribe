
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface PatientsHeaderProps {
  onCreateNewPatient: () => void;
}

export function PatientsHeader({ onCreateNewPatient }: PatientsHeaderProps) {
  return (
    <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Pacientes</h1>
        <p className="text-muted-foreground">Gestiona la información de los pacientes</p>
      </div>
      <Button 
        className="bg-medivoz-500 hover:bg-medivoz-600 w-full md:w-auto"
        onClick={onCreateNewPatient}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Nuevo Paciente
      </Button>
    </header>
  );
}
