import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PatientDialog } from "@/components/PatientDialog";
import { toast } from "sonner";
import { Patient } from "@/components/patients/PatientDialogTypes";

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  selectedPatient: Patient | null;
}

export function PatientSearch({ onPatientSelect, selectedPatient }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['patientSearch', debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nombre, dni, edad, diagnostico')
        .or(`nombre.ilike.%${debouncedSearchQuery}%,dni.ilike.%${debouncedSearchQuery}%`)
        .limit(5);
      
      if (error) {
        toast.error("Error al buscar pacientes");
        console.error("Error searching patients:", error);
        return [];
      }
      
      return data as Patient[];
    },
    enabled: debouncedSearchQuery.length >= 2
  });
  
  const handleSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setSearchQuery("");
  };
  
  const handleClearSelection = () => {
    onPatientSelect(null as any);
  };
  
  const handlePatientCreated = () => {
    toast.success("Paciente creado. Ahora puedes seleccionarlo en la búsqueda.");
  };
  
  return (
    <div className="space-y-4">
      {selectedPatient ? (
        <Card className="border-2 border-asclepia-100">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-lg">{selectedPatient.nombre}</h3>
                <p className="text-sm text-muted-foreground">DNI: {selectedPatient.dni}</p>
                {selectedPatient.edad && <p className="text-sm">{selectedPatient.edad} años</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente por nombre o DNI"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsPatientDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </div>
          
          {debouncedSearchQuery.length >= 2 && !isLoading && searchResults && (
            <div className="border rounded-md divide-y">
              {searchResults.length > 0 ? (
                searchResults.map((patient) => (
                  <div 
                    key={patient.id} 
                    className="p-3 hover:bg-muted cursor-pointer flex justify-between"
                    onClick={() => handleSelect(patient)}
                  >
                    <div>
                      <div className="font-medium">{patient.nombre}</div>
                      <div className="text-sm text-muted-foreground">DNI: {patient.dni}</div>
                    </div>
                    {patient.edad && <div className="text-sm">{patient.edad} años</div>}
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No se encontraron resultados
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <PatientDialog 
        open={isPatientDialogOpen} 
        onOpenChange={setIsPatientDialogOpen}
        onSuccess={handlePatientCreated}
      />
    </div>
  );
}
