
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent 
} from "@/components/ui/card";
import { Mic, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Dashboard() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
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
      
      return data;
    },
    enabled: !!user?.id
  });
  
  useEffect(() => {
    if (error) {
      toast.error("Error al cargar el perfil del doctor");
      console.error(error);
    }
  }, [error]);
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-64">
        <div className="container mx-auto py-6 px-4 md:px-6">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Panel Principal</h1>
            <p className="text-muted-foreground">
              Bienvenido, {doctorProfile?.full_name || "Doctor"}
            </p>
          </header>
          
          <div className="mb-6">
            {isLoading ? (
              <Card className="p-6">
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-medivoz-500" />
                </div>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Información Personal</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-muted-foreground">Nombre</dt>
                      <dd className="font-medium">{doctorProfile?.full_name || "No especificado"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Especialidad</dt>
                      <dd className="font-medium">{doctorProfile?.specialty || "No especificada"}</dd>
                    </div>
                    {doctorProfile?.avatar_url && (
                      <div className="mt-3">
                        <dt className="text-sm text-muted-foreground mb-1">Foto de perfil</dt>
                        <img 
                          src={doctorProfile.avatar_url} 
                          alt="Avatar" 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg md:text-xl font-bold mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/session" className="block">
                <Card className="hover:shadow-md transition-all h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-medivoz-100 flex items-center justify-center text-medivoz-600">
                      <Mic className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Nueva Sesión</h3>
                      <p className="text-xs text-muted-foreground">Iniciar grabación</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/patients" className="block">
                <Card className="hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Pacientes</h3>
                      <p className="text-xs text-muted-foreground">Gestionar pacientes</p>
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
