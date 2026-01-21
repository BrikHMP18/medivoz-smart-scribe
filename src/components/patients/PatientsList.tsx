import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Edit, Loader2, Trash, FileText, Eye, User } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface PatientsListProps {
  patients: Patient[] | null;
  isLoading: boolean;
  searchQuery: string;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onViewRecord: (patient: Patient) => void;
}

export function PatientsList({ patients, isLoading, searchQuery, onEdit, onDelete, onViewRecord }: PatientsListProps) {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed border-border/60">
        <div className="mx-auto max-w-md flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
             <User className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
          {searchQuery ? (
            <>
                <h3 className="text-lg font-semibold text-foreground">
                No se encontraron pacientes
              </h3>
              <p className="text-sm text-muted-foreground">
                  No hay resultados para "{searchQuery}"
              </p>
            </>
          ) : (
            <>
                <h3 className="text-lg font-semibold text-foreground">
                No hay pacientes registrados
              </h3>
                <p className="text-sm text-muted-foreground">
                Comienza agregando tu primer paciente para poder crear sesiones médicas
              </p>
            </>
          )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
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
            onViewRecord={() => onViewRecord(patient)}
          />
        ))}
      </div>
      
      {/* Desktop view: Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px] font-semibold">Paciente</TableHead>
              <TableHead className="font-semibold">DNI</TableHead>
              <TableHead className="font-semibold">Edad</TableHead>
              <TableHead className="font-semibold">Última Visita</TableHead>
              <TableHead className="font-semibold">Ficha Médica</TableHead>
              <TableHead className="text-right font-semibold pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients?.map((patient) => (
              <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/30 transition-colors group">
                <TableCell className="font-medium py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {patient.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <Link to={`/session?patientId=${patient.id}`} className="hover:text-primary transition-colors font-semibold">
                    {patient.nombre}
                  </Link>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{patient.dni}</TableCell>
                <TableCell>{patient.edad ? `${patient.edad} años` : <span className="text-muted-foreground text-xs italic">N/A</span>}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{patient.ultima_visita ? formatDate(patient.ultima_visita) : "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onViewRecord(patient);
                    }}
                    className="h-8 px-3 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Ver
                  </Button>
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit(patient);
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
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
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
    </div>
  );
}
