
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent 
} from "@/components/ui/card";
import { Mic, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const isMobile = useIsMobile();
  
  // Mock doctor data
  const doctor = {
    name: "Dr. Alejandro Sánchez",
    specialty: "Neurología",
    hospital: "Hospital Central Universitario"
  };
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-64">
        <div className="container mx-auto py-6 px-4 md:px-6">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Panel Principal</h1>
            <p className="text-muted-foreground">Bienvenido, {doctor.name}</p>
          </header>
          
          <div className="mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Información Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-muted-foreground">Nombre</dt>
                    <dd className="font-medium">{doctor.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Especialidad</dt>
                    <dd className="font-medium">{doctor.specialty}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Hospital</dt>
                    <dd className="font-medium">{doctor.hospital}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
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
