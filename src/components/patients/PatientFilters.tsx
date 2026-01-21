
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CardTitle } from "@/components/ui/card";

interface PatientFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function PatientFilters({ searchQuery, onSearchChange }: PatientFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <CardTitle>Lista de Pacientes</CardTitle>
      <div className="flex items-center w-full sm:w-64">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <Input
          placeholder="Buscar por nombre, DNI o diagnóstico..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
