
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Search, UserPlus, Loader2, Edit, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { PatientCard } from "@/components/PatientCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { PatientDialog } from "@/components/PatientDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

// Type definition based on Supabase schema
interface Patient {
  id: string;
  nombre: string;
  edad: number | null;
  dni: string;
  ocupacion: string | null;
  procedencia: string | null;
  diagnostico: string | null;
  ultima_visita: string | null;
}

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  
  const isMobile = useIsMobile();
  
  // Fetch patients from Supabase
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
    }
  });
  
  useEffect(() => {
    if (error) {
      toast.error("Error al cargar los pacientes");
      console.error(error);
    }
  }, [error]);
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };
  
  const handlePatientCreated = () => {
    refetch();
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
      refetch();
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
          <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Pacientes</h1>
              <p className="text-muted-foreground">Gestiona la información de los pacientes</p>
            </div>
            <Button 
              className="bg-medivoz-500 hover:bg-medivoz-600 w-full md:w-auto"
              onClick={handleCreateNewPatient}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Paciente
            </Button>
          </header>
          
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Lista de Pacientes</CardTitle>
                <div className="flex items-center w-full sm:w-64">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input
                    placeholder="Buscar por nombre, DNI o diagnóstico..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-medivoz-500" />
                </div>
              ) : (
                <>
                  {/* Mobile view: Cards */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {patients && patients.length > 0 ? (
                      patients.map((patient) => (
                        <PatientCard 
                          key={patient.id}
                          id={patient.id}
                          name={patient.nombre}
                          age={patient.edad || 0}
                          lastVisit={patient.ultima_visita ? formatDate(patient.ultima_visita) : "Sin visitas"}
                          diagnosis={patient.diagnostico || undefined}
                          onEdit={() => handleEditPatient(patient)}
                          onDelete={() => handleDeletePatient(patient)}
                        />
                      ))
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">
                        {searchQuery ? "No se encontraron pacientes con ese criterio" : "No hay pacientes registrados"}
                      </p>
                    )}
                  </div>
                  
                  {/* Desktop view: Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>DNI</TableHead>
                          <TableHead>Edad</TableHead>
                          <TableHead>Última Visita</TableHead>
                          <TableHead>Diagnóstico</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patients && patients.length > 0 ? (
                          patients.map((patient) => (
                            <TableRow key={patient.id} className="cursor-pointer hover:bg-muted">
                              <TableCell className="font-medium">
                                <Link to={`/session?patientId=${patient.id}`} className="hover:underline">
                                  {patient.nombre}
                                </Link>
                              </TableCell>
                              <TableCell>{patient.dni}</TableCell>
                              <TableCell>{patient.edad || "N/A"}</TableCell>
                              <TableCell>{patient.ultima_visita ? formatDate(patient.ultima_visita) : "Sin visitas"}</TableCell>
                              <TableCell>{patient.diagnostico || "Sin diagnóstico"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleEditPatient(patient);
                                    }}
                                    className="h-8 w-8"
                                    title="Editar paciente"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeletePatient(patient);
                                    }}
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    title="Eliminar paciente"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                              {searchQuery ? "No se encontraron pacientes con ese criterio" : "No hay pacientes registrados"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Patient Dialog */}
          <PatientDialog 
            open={isPatientDialogOpen} 
            onOpenChange={setIsPatientDialogOpen}
            onSuccess={handlePatientCreated}
            patient={selectedPatient}
            mode={dialogMode}
          />
          
          {/* Delete Confirmation Dialog */}
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
