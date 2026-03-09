import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, X } from "lucide-react";
import { PatientSearch } from "@/components/PatientSearch";
import { Patient } from "@/components/patients/PatientDialogTypes";

interface SessionPatientCardProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
}

export function SessionPatientCard({ selectedPatient, onPatientSelect }: SessionPatientCardProps) {
  return (
    <Card className="overflow-hidden border-border/40 shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <User className="h-4 w-4 text-primary" />
            </div>
            Paciente
          </div>
          {selectedPatient && (
            <Badge variant="secondary" className="font-normal text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
              Seleccionado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        {selectedPatient ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                {selectedPatient.nombre.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{selectedPatient.nombre}</h3>
                <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground mt-0.5">
                  <span>DNI: {selectedPatient.dni}</span>
                  {selectedPatient.edad && (
                    <span>{selectedPatient.edad} anos</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                  Diagnostico
                </p>
                <p className="text-xs font-medium truncate" title={selectedPatient.diagnostico || "Sin diagnostico"}>
                  {selectedPatient.diagnostico || (
                    <span className="text-muted-foreground italic">Sin registro</span>
                  )}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50 border border-border/40">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                  Procedencia
                </p>
                <p className="text-xs font-medium truncate" title={selectedPatient.procedencia || "Sin procedencia"}>
                  {selectedPatient.procedencia || (
                    <span className="text-muted-foreground italic">Sin registro</span>
                  )}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPatientSelect(null)}
              className="w-full text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/60 hover:border-border h-8"
            >
              <X className="h-3 w-3 mr-1.5" />
              Cambiar paciente
            </Button>
          </div>
        ) : (
          <div className="py-1">
            <PatientSearch onPatientSelect={onPatientSelect} selectedPatient={selectedPatient} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
