import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { History, Search, FileText, Clock, User, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import { MedicalRecordModal } from "@/components/MedicalRecordModal";

interface SessionWithPatient {
  id: string;
  codigo_sesion: string;
  created_at: string;
  fecha_consulta: string;
  transcripcion: string | null;
  pacientes: {
    id: string;
    nombre: string;
    dni: string;
    edad: number | null;
  };
}

export default function SessionHistory() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<SessionWithPatient | null>(null);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["session-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("sesiones")
        .select(`
          id,
          codigo_sesion,
          created_at,
          fecha_consulta,
          transcripcion,
          pacientes (
            id,
            nombre,
            dni,
            edad
          )
        `)
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown as SessionWithPatient[]) || [];
    },
    enabled: !!user?.id,
  });

  const filteredSessions = sessions?.filter((session) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      session.pacientes?.nombre?.toLowerCase().includes(term) ||
      session.pacientes?.dni?.includes(term) ||
      session.codigo_sesion?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-60">
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-6xl">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                <History className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Historial de Sesiones
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-[52px]">
              Revisa consultas pasadas, transcripciones y fichas medicas
            </p>
          </header>

          {/* Search */}
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente, DNI o codigo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Sessions list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !filteredSessions?.length ? (
            <Card className="border-dashed border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <History className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <h3 className="text-base font-semibold mb-1">
                  {searchTerm ? "Sin resultados" : "Sin sesiones aun"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {searchTerm
                    ? "Intenta con otro termino de busqueda"
                    : "Las sesiones apareceran aqui despues de grabar tu primera consulta"}
                </p>
                {!searchTerm && (
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link to="/session">Iniciar nueva sesion</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-2">
              {filteredSessions.map((session) => (
                <Card
                  key={session.id}
                  className="border-border/40 hover:border-primary/20 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                  onClick={() => setSelectedSession(session)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {session.pacientes?.nombre?.substring(0, 2).toUpperCase() || "??"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {session.pacientes?.nombre || "Paciente desconocido"}
                        </h3>
                        <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                          {session.codigo_sesion}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(session.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                        </span>
                        {session.pacientes?.dni && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            DNI: {session.pacientes.dni}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {session.transcripcion ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 text-[10px]">
                          <FileText className="h-3 w-3 mr-1" />
                          Transcrita
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground text-[10px]">
                          Sin transcripcion
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <MedicalRecordModal
            open={!!selectedSession}
            onOpenChange={(open) => { if (!open) setSelectedSession(null); }}
            sessionId={selectedSession?.id}
            patientId={selectedSession?.pacientes?.id}
          />
        </div>
      </div>
    </div>
  );
}
