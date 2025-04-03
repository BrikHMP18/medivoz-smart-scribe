
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent 
} from "@/components/ui/card";
import { Mic } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // Mock doctor data
  const doctor = {
    name: "Dr. Alejandro Sánchez",
    specialty: "Neurología",
    hospital: "Hospital Central Universitario"
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-64">
        <div className="container py-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Panel Principal</h1>
            <p className="text-muted-foreground">Bienvenido, {doctor.name}</p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Información Personal</CardTitle>
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
            <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/session" className="block">
                <Card className="hover:shadow-md transition-all">
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
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
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
