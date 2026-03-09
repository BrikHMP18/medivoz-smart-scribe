import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Calendar, Clock, AlertCircle, Activity, History, Clipboard, Brain, StickyNote, FileSearch } from "lucide-react";
import { Patient } from "@/components/patients/PatientDialogTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MedicalRecordFormData } from "@/hooks/medical-record/types";
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";

interface PatientRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

type RecordRow = MedicalRecordFormData & {
  sesion_id: string;
  updated_at: string;
};

const fieldOrder: Array<{ key: keyof MedicalRecordFormData; label: string; icon?: React.ReactNode }> = [
  { key: "motivo_consulta", label: "Motivo de consulta", icon: <AlertCircle className="h-4 w-4" /> },
  { key: "historia_cronologica", label: "Historia cronológica", icon: <History className="h-4 w-4" /> },
  { key: "tiempo_enfermedad", label: "Tiempo de enfermedad", icon: <Clock className="h-4 w-4" /> },
  { key: "forma_inicio", label: "Forma de inicio", icon: <Activity className="h-4 w-4" /> },
  { key: "curso_enfermedad", label: "Curso de la enfermedad", icon: <Activity className="h-4 w-4" /> },
  { key: "sintomas_principales", label: "Síntomas principales", icon: <Clipboard className="h-4 w-4" /> },
  { key: "antecedentes", label: "Antecedentes", icon: <Brain className="h-4 w-4" /> },
  { key: "estado_funcional_basal", label: "Estado funcional basal", icon: <Activity className="h-4 w-4" /> },
  { key: "estudios_previos", label: "Estudios previos", icon: <FileSearch className="h-4 w-4" /> },
  { key: "notas_adicionales", label: "Notas adicionales", icon: <StickyNote className="h-4 w-4" /> }
];

export function PatientRecordModal({ open, onOpenChange, patient }: PatientRecordModalProps) {
  const [record, setRecord] = useState<RecordRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && patient?.id) {
      fetchRecord(patient.id);
    } else {
      setRecord(null);
    }
  }, [open, patient?.id]);

  const fetchRecord = async (patientId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("fichas_medicas")
        .select("*")
        .eq("paciente_id", patientId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        const mapped: RecordRow = {
          motivo_consulta: data.motivo_consulta || "",
          tiempo_enfermedad: data.tiempo_enfermedad || "",
          forma_inicio: data.forma_inicio || "",
          curso_enfermedad: data.curso_enfermedad || "",
          historia_cronologica: data.historia_cronologica || "",
          sintomas_principales: data.sintomas_principales || "",
          antecedentes: data.antecedentes || "",
          estado_funcional_basal: data.estado_funcional_basal || "",
          estudios_previos: data.estudios_previos || "",
          notas_adicionales: data.notas_adicionales || "",
          sesion_id: data.sesion_id,
          updated_at: data.updated_at
        };
        setRecord(mapped);
      } else {
        setRecord(null);
      }
    } catch (err) {
      logger.error("Error fetching medical record:", err);
      toast.error("No se pudo cargar la ficha médica del paciente");
      setRecord(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (label: string, value: string, icon?: React.ReactNode) => {
    const hasValue = Boolean(value?.trim());
    const displayValue = hasValue ? value : "Sin información registrada";
    
    return (
      <div key={label} className="space-y-2 animate-fade-in group">
        <h4 className="text-sm font-semibold text-primary flex items-center gap-2 uppercase tracking-wider text-[11px]">
          {icon && (
            <span className="p-1 bg-primary/10 rounded-md text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {icon}
            </span>
          )}
          {label}
        </h4>
        <div
          className={cn(
            "rounded-xl border border-border/50 bg-card/50 p-4 text-sm leading-relaxed whitespace-pre-line shadow-sm transition-all duration-300",
            "hover:shadow-md hover:border-primary/20 hover:bg-card",
            hasValue ? "text-foreground/90" : "text-muted-foreground italic"
          )}
        >
          {displayValue}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-[85vh] flex flex-col p-0 overflow-hidden gap-0 sm:rounded-2xl border-none shadow-2xl bg-background/95 backdrop-blur-md">
        <DialogHeader className="px-8 py-6 border-b shrink-0 bg-muted/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg shadow-primary/20">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                Historia Clínica
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pl-1">
                {patient ? (
                  <>
                    <span className="font-semibold text-foreground text-base">
                      {patient.nombre}
                    </span>
                    <span className="hidden sm:inline text-muted-foreground/40">|</span>
                    <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded-md border border-border/50">DNI: {patient.dni}</span>
                  </>
                ) : (
                  "Cargando información..."
                )}
              </DialogDescription>
            </div>
            {record?.updated_at && (
              <Badge variant="outline" className="w-fit flex items-center gap-1.5 px-3 py-1.5 h-fit bg-background/50 backdrop-blur shadow-sm border-primary/20">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">
                  {new Date(record.updated_at).toLocaleDateString("es-PE", {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 w-full">
          <div className="px-8 py-8 w-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground animate-pulse">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                   <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <p className="text-sm font-medium">Cargando ficha médica...</p>
              </div>
            ) : record ? (
              <div className="grid gap-8 max-w-5xl mx-auto w-full">
                {/* Primary Information Section */}
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                       {renderField(
                        fieldOrder[0].label, 
                        record[fieldOrder[0].key] ?? "",
                        fieldOrder[0].icon
                      )}
                       {renderField(fieldOrder[4].label, record[fieldOrder[4].key] ?? "")}
                    </div>
                    <div className="space-y-6">
                      {renderField(fieldOrder[2].label, record[fieldOrder[2].key] ?? "")}
                      {renderField(fieldOrder[3].label, record[fieldOrder[3].key] ?? "")}
                      {renderField("Curso", record[fieldOrder[4].key] ? (record.curso_enfermedad || "No especificado") : "", <Activity className="h-4 w-4" />)}
                    </div>
                  </div>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="bg-background px-4 text-muted-foreground font-medium">
                      Información Adicional
                    </span>
                  </div>
                </div>

                {/* Secondary Information */}
                <div className="grid gap-6 md:grid-cols-2">
                  {fieldOrder.slice(5).map(({ key, label, icon }) => {
                    const val = record[key];
                    if (!val) return null;
                    return (
                       <div key={key} className="col-span-2 md:col-span-1 h-full">
                          {renderField(label, val, icon)}
                       </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-32 text-muted-foreground gap-6 max-w-md mx-auto">
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-inner">
                  <FileText className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Sin ficha registrada</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Este paciente aún no tiene una historia clínica registrada en el sistema. 
                    Inicia una nueva sesión para generar la documentación automáticamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-8 py-5 border-t shrink-0 bg-muted/30 backdrop-blur-sm flex-col-reverse sm:flex-row gap-4 justify-between items-center">
           <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {record?.sesion_id && (
                <>
                  <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                  <span className="font-mono bg-muted px-2 py-0.5 rounded border">ID: {record.sesion_id.substring(0, 8)}</span>
                </>
              )}
           </div>
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full sm:w-auto shadow-lg hover:shadow-primary/20 transition-all rounded-xl px-8"
            variant="default"
          >
            Cerrar Ficha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
