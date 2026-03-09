
import { useState, useEffect, useMemo } from "react";
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
import { PatientRecordModal } from "@/components/patients/PatientRecordModal";
import { logger } from "@/utils/logger";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  // Debounce sobre el valor ya recortado para evitar consultas con espacios
  const trimmedSearch = useMemo(() => searchQuery.trim(), [searchQuery]);
  const [debouncedSearchQuery] = useDebounce(trimmedSearch, 350);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [recordPatient, setRecordPatient] = useState<Patient | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  
  const { data: patients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['patients', debouncedSearchQuery || 'all'],
    queryFn: async () => {
      let query = supabase.from('pacientes').select('*');
      
      if (debouncedSearchQuery && debouncedSearchQuery.trim().length > 0) {
        // Sanitize: escape special PostgREST filter characters
        const sanitized = debouncedSearchQuery.replace(/[%_\\(),."']/g, '');
        if (sanitized.length > 0) {
          query = query.or(`nombre.ilike.%${sanitized}%,dni.ilike.%${sanitized}%,diagnostico.ilike.%${sanitized}%`);
        }
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (error) {
        throw new Error(`Error fetching patients: ${error.message}`);
      }
      
      return data || [];
    },
    select: (data) => {
      // Transform data using select instead of in component
      // This ensures transformation only happens when data changes
      return data as Patient[];
    },
    enabled: true, // Always enabled, but we optimize with debounce
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
  
  useEffect(() => {
  if (error) {
    toast.error("Error al cargar los pacientes");
      logger.error("Patients query error:", error);
  }
  }, [error]);
  
  
  const handlePatientCreated = () => {
    refetch();
    toast.success("¡Paciente creado exitosamente! Ya puedes crear sesiones médicas.");
  };
  
  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setDialogMode('edit');
    setIsPatientDialogOpen(true);
  };

  const handleViewRecord = (patient: Patient) => {
    setRecordPatient(patient);
    setIsRecordModalOpen(true);
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
      logger.error("Error eliminando paciente:", error);
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
      <div className="flex-1 overflow-auto pl-16 lg:pl-60">
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
                onViewRecord={handleViewRecord}
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

          <PatientRecordModal
            open={isRecordModalOpen}
            onOpenChange={setIsRecordModalOpen}
            patient={recordPatient}
          />
        </div>
      </div>
    </div>
  );
}
