import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Edit, Loader2, Trash } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PatientCard } from "@/components/PatientCard";
import { Patient } from "@/components/patients/PatientDialogTypes";

interface PatientsListProps {
  patients: Patient[] | null;
  isLoading: boolean;
  searchQuery: string;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export function PatientsList({ patients, isLoading, searchQuery, onEdit, onDelete }: PatientsListProps) {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-asclepia-500" />
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          {searchQuery ? (
            <>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No se encontraron pacientes
              </h3>
              <p className="text-sm text-muted-foreground">
                No hay pacientes que coincidan con "{searchQuery}"
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No hay pacientes registrados
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comienza agregando tu primer paciente para poder crear sesiones médicas
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile view: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {patients?.map((patient) => (
          <PatientCard 
            key={patient.id}
            id={patient.id}
            name={patient.nombre}
            age={patient.edad || 0}
            lastVisit={patient.ultima_visita ? formatDate(patient.ultima_visita) : "Sin visitas"}
            diagnosis={patient.diagnostico || undefined}
            onEdit={() => onEdit(patient)}
            onDelete={() => onDelete(patient)}
          />
        ))}
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
            {patients?.map((patient) => (
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
                        onEdit(patient);
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
                        onDelete(patient);
                      }}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Eliminar paciente"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
