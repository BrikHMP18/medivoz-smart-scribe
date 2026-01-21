
import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import { Mic, Users, Loader2, Activity, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

interface DoctorProfile {
  id: string;
  full_name: string;
  specialty?: string;
  avatar_url?: string;
  firstName?: string;
}

export default function Dashboard() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buenos días");
    else if (hour < 18) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");
  }, []);
  
  const { data: doctorProfile, isLoading, error } = useQuery({
    queryKey: ['doctorProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw new Error(`Error fetching doctor profile: ${error.message}`);
      }
      
      return data as DoctorProfile;
    },
    select: (data) => {
      // Transform data using select instead of in component
      // Extract first name from full_name for better performance
      if (!data) return null;
      
      return {
        ...data,
        firstName: data.full_name?.split(' ')[0] || "Doctor",
      };
    },
    enabled: !!user?.id, // Only fetch when user ID is available
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
  
  useEffect(() => {
    if (error) {
      toast.error("Error al cargar el perfil del doctor");
      logger.error("Dashboard query error:", error);
    }
  }, [error]);
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-64">
        <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl">
          <header className="mb-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  {greeting}, <span className="text-primary">{doctorProfile?.firstName || "Doctor"}</span>
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Bienvenido a tu panel de control de Medivoz.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border/50">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </header>
          
          <div className="grid gap-8 md:grid-cols-3 mb-10">
            {isLoading ? (
               Array(3).fill(0).map((_, i) => (
                <Card key={i} className="h-32 animate-pulse bg-muted/50 border-none" />
               ))
            ) : (
              <>
                <Card className="md:col-span-2 border-none shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="h-32 w-32 text-primary" />
                  </div>
                  <CardHeader className="relative z-10 pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <div className="p-2 bg-background rounded-lg shadow-sm">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      Información Profesional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                      <div className="space-y-1">
                         <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Nombre Completo</p>
                         <p className="font-semibold text-lg text-foreground">{doctorProfile?.full_name || "No especificado"}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Especialidad</p>
                         <p className="font-semibold text-lg text-foreground">{doctorProfile?.specialty || "No especificada"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md flex flex-col justify-center items-center p-6 bg-card hover:bg-accent/5 transition-colors group cursor-default">
                   <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {doctorProfile?.avatar_url ? (
                        <img 
                          src={doctorProfile.avatar_url} 
                          alt="Avatar" 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-8 w-8 text-muted-foreground" />
                      )}
                   </div>
                   <p className="font-medium text-sm text-muted-foreground">Estado: <span className="text-green-500 font-bold">Activo</span></p>
                </Card>
              </>
            )}
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/session" className="block group">
                <Card className="border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 h-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500" />
                  <CardContent className="p-8 flex items-center gap-6 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                      <Mic className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl group-hover:text-primary transition-colors">Nueva Sesión</h3>
                      <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
                        Iniciar grabación y transcripción de consulta médica
                      </p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="h-6 w-6 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/patients" className="block group">
                <Card className="border-border/50 hover:border-green-500/50 hover:shadow-lg transition-all duration-300 h-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-transparent transition-all duration-500" />
                  <CardContent className="p-8 flex items-center gap-6 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Users className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl group-hover:text-green-600 transition-colors">Pacientes</h3>
                      <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
                        Gestionar listado y expedientes de pacientes
                      </p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
