
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { 
  Card, 
  CardHeader,
  CardContent 
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { supabase } from "@/integrations/supabase/client";
import { PatientDialog } from "@/components/PatientDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { PatientsHeader } from "@/components/patients/PatientsHeader";
import { PatientFilters } from "@/components/patients/PatientFilters";
import { PatientsList } from "@/components/patients/PatientsList";
import { Patient, PatientDialogMode } from "@/components/patients/PatientDialogTypes";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  
  const { data: patients, isLoading, error, refetch } = useQuery({
    queryKey: ['patients', debouncedSearchQuery],
    queryFn: async () => {
      let query = supabase.from('pacientes').select('*');
      
      if (debouncedSearchQuery) {
        query = query.or(`nombre.ilike.%${debouncedSearchQuery}%,dni.ilike.%${debouncedSearchQuery}%,diagnostico.ilike.%${debouncedSearchQuery}%`);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (error) {
        throw new Error(`Error fetching patients: ${error.message}`);
      }
      
      return data as Patient[];
    },
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
  
  if (error) {
    toast.error("Error al cargar los pacientes");
    console.error("Patients query error:", error);
  }
  
  
  const handlePatientCreated = () => {
    refetch();
    toast.success("¡Paciente creado exitosamente! Ya puedes crear sesiones médicas.");
  };
  
  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setDialogMode('edit');
    setIsPatientDialogOpen(true);
  };
  
  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeletePatient = async () => {
    if (!selectedPatient) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', selectedPatient.id);
      
      if (error) throw error;
      
      toast.success("Paciente eliminado correctamente");
      await refetch();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error eliminando paciente:", error);
      toast.error("Error al eliminar el paciente");
    } finally {
      setIsDeleting(false);
      setSelectedPatient(null);
    }
  };
  
  const handleCreateNewPatient = () => {
    setSelectedPatient(null);
    setDialogMode('create');
    setIsPatientDialogOpen(true);
  };
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-64">
        <div className="container mx-auto py-6 px-4 md:px-6">
          <PatientsHeader onCreateNewPatient={handleCreateNewPatient} />
          
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <PatientFilters 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
              />
            </CardHeader>
            <CardContent>
              <PatientsList 
                patients={patients}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
              />
            </CardContent>
          </Card>
          
          <PatientDialog 
            open={isPatientDialogOpen} 
            onOpenChange={setIsPatientDialogOpen}
            onSuccess={handlePatientCreated}
            patient={selectedPatient}
            mode={dialogMode}
          />
          
          <DeleteConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={confirmDeletePatient}
            title="Eliminar paciente"
            description={`¿Estás seguro de que deseas eliminar a ${selectedPatient?.nombre}? Esta acción no se puede deshacer.`}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}
