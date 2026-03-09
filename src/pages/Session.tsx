import { useState, useEffect, useCallback, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SessionRecorder } from "@/components/SessionRecorder";
import { Transcription } from "@/components/Transcription";
import { SessionPatientCard } from "@/components/session/SessionPatientCard";
import { EmptyRecordPlaceholder } from "@/components/session/EmptyRecordPlaceholder";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Activity, Stethoscope } from "lucide-react";
import { Patient } from "@/components/patients/PatientDialogTypes";
import { Badge } from "@/components/ui/badge";
import { useMedicalRecord } from "@/hooks/medical-record/use-medical-record";
import { MedicalRecordContainer } from "@/components/medical-record-modal/MedicalRecordContainer";
import { PatientInfoCard } from "@/components/medical-record/PatientInfoCard";

export default function Session() {
  const [transcription, setTranscription] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const patientId = selectedPatient?.id || null;

  const {
    formData,
    patientData,
    transcriptionSnippet,
    fullTranscription,
    showFullTranscription,
    isSaving,
    isExporting,
    handleChange,
    toggleTranscriptionView,
    handleSave,
    handleExportPDF,
    setFormData,
    recordExists,
    refreshTranscription,
  } = useMedicalRecord(currentSessionId, patientId);

  const loadPatient = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("pacientes")
        .select("id, nombre, dni, edad, diagnostico, ocupacion, procedencia")
        .eq("id", id)
        .single();
      if (error) throw error;
      if (data) {
        setSelectedPatient(data);
        toast.success(`Paciente ${data.nombre} cargado correctamente`);
      }
    } catch (error) {
      logger.error("Error loading patient:", error);
      toast.error("Error al cargar el paciente");
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get("patientId");
    if (id) loadPatient(id);
  }, [searchParams, loadPatient]);

  const handleSessionCreated = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    toast.success(`Sesión ${sessionId} iniciada correctamente`);
  }, []);

  const handleTranscriptionReady = useCallback((text: string) => {
    setTranscription(text);
  }, []);

  useEffect(() => {
    if (transcription && currentSessionId) {
      const timeoutId = setTimeout(async () => {
        logger.log("Refreshing transcription from DB for session:", currentSessionId);
        await refreshTranscription();
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [transcription, currentSessionId, refreshTranscription]);

  const patientInfoProps = useMemo(() => {
    const patient = patientData || selectedPatient;
    if (!patient) return null;
    return {
      name: patient.nombre || "",
      age: patient.edad ?? null,
      occupation: patient.ocupacion ?? null,
      location: patient.procedencia ?? null,
    };
  }, [patientData, selectedPatient]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-60 scroll-smooth">
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-[1600px]">
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
                Sesión de Consulta
              </h1>
              <p className="text-muted-foreground mt-1 ml-1">
                Gestión integral de la consulta médica asistida por IA
              </p>
            </div>
            {currentSessionId && (
              <div className="flex items-center gap-2 bg-muted/40 px-4 py-2 rounded-full border border-border/50 animate-in fade-in slide-in-from-right-5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground">
                  Sesión Activa:{" "}
                  <span className="font-mono text-foreground ml-1">
                    {currentSessionId.substring(0, 8)}
                  </span>
                </span>
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full pb-10">
            {/* Left Column: Patient & Recording */}
            <div className="xl:col-span-5 flex flex-col gap-8">
              <SessionPatientCard
                selectedPatient={selectedPatient}
                onPatientSelect={setSelectedPatient}
              />

              {/* Recorder */}
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20" />
                  <SessionRecorder
                    onTranscriptionReady={handleTranscriptionReady}
                    patientId={selectedPatient?.id || null}
                    isPatientSelected={!!selectedPatient}
                    onSessionCreated={handleSessionCreated}
                  />
                </div>

                {/* Transcription panel */}
                <div className="flex-1 min-h-[350px] bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Transcripción en vivo
                    </h3>
                    {transcription && (
                      <Badge variant="outline" className="bg-background text-[10px] uppercase">
                        Procesado
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <Transcription transcription={transcription} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Medical Record */}
            <div className="xl:col-span-7 flex flex-col h-full min-h-[600px]">
              <Card className="flex flex-col h-full border-none shadow-lg bg-card relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />

                <CardHeader className="border-b bg-muted/10 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Historia Clínica Electrónica
                      </CardTitle>
                      <CardDescription>
                        Documentación automática estructurada basada en la transcripción
                      </CardDescription>
                    </div>
                    {recordExists && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 border-amber-200"
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Ficha Existente
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-0 bg-muted/5">
                  {patientId && currentSessionId ? (
                    <div className="px-6 py-6 max-w-4xl mx-auto w-full">
                      {patientInfoProps && (
                        <div className="mb-6">
                          <PatientInfoCard
                            name={patientInfoProps.name}
                            age={patientInfoProps.age}
                            occupation={patientInfoProps.occupation}
                            location={patientInfoProps.location}
                          />
                        </div>
                      )}
                      <div className="bg-background rounded-xl border shadow-sm p-1">
                        <MedicalRecordContainer
                          formData={formData}
                          setFormData={setFormData}
                          transcriptionSnippet={transcriptionSnippet}
                          fullTranscription={fullTranscription}
                          showFullTranscription={showFullTranscription}
                          toggleTranscriptionView={toggleTranscriptionView}
                          handleChange={handleChange}
                          isSaving={isSaving}
                          isExporting={isExporting}
                          onClose={() => {}}
                          onSave={async () => {
                            await handleSave();
                          }}
                          onExport={async () => {
                            await handleExportPDF();
                          }}
                          refreshTranscription={refreshTranscription}
                          patientId={patientId}
                          sessionId={currentSessionId}
                          showCloseButton={false}
                        />
                      </div>
                    </div>
                  ) : (
                    <EmptyRecordPlaceholder />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
