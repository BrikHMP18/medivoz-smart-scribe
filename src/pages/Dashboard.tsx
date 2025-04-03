
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientCard } from "@/components/PatientCard";
import { Plus, Search, Calendar, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock doctor data
  const doctor = {
    name: "Dr. Alejandro Sánchez",
    specialty: "Neurología",
    hospital: "Hospital Central Universitario",
    patients: 125,
    nextAppointment: "Hoy, 15:30"
  };
  
  // Mock patient data
  const patients = [
    { 
      id: "p1", 
      name: "Carlos Rodríguez", 
      age: 42, 
      lastVisit: "22/04/2023", 
      diagnosis: "Migraña" 
    },
    { 
      id: "p2", 
      name: "María González", 
      age: 58, 
      lastVisit: "15/04/2023", 
      diagnosis: "Hipertensión" 
    },
    { 
      id: "p3", 
      name: "José Martínez", 
      age: 36, 
      lastVisit: "10/04/2023", 
      diagnosis: "Ansiedad" 
    },
    { 
      id: "p4", 
      name: "Laura Jiménez", 
      age: 29, 
      lastVisit: "05/04/2023", 
      diagnosis: "Gastritis" 
    },
    { 
      id: "p5", 
      name: "Roberto Fernández", 
      age: 67, 
      lastVisit: "01/04/2023", 
      diagnosis: "Artritis" 
    }
  ];
  
  // Filter patients based on search query
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-16 lg:pl-64">
        <div className="container py-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Panel Principal</h1>
            <p className="text-muted-foreground">Bienvenido, {doctor.name}</p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Pacientes</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{doctor.patients}</div>
                  <p className="text-sm text-muted-foreground">Pacientes registrados</p>
                </div>
                <Link to="/patients">
                  <Button variant="outline" size="sm">Ver todos</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Próxima Cita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{doctor.nextAppointment}</div>
                    <p className="text-sm text-muted-foreground">María González</p>
                  </div>
                  <Link to="/session">
                    <Button size="sm" className="bg-medivoz-500 hover:bg-medivoz-600">
                      <Mic className="h-4 w-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Nuevo Paciente</h3>
                    <p className="text-xs text-muted-foreground">Agregar registro</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Agendar Cita</h3>
                    <p className="text-xs text-muted-foreground">Programar consulta</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Buscar Paciente</h3>
                    <p className="text-xs text-muted-foreground">Consultar historial</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div>
            <Tabs defaultValue="recent">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="recent">Pacientes Recientes</TabsTrigger>
                  <TabsTrigger value="all">Todos los Pacientes</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input
                    placeholder="Buscar paciente..."
                    className="w-60"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <TabsContent value="recent" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPatients.slice(0, 3).map((patient) => (
                    <PatientCard key={patient.id} {...patient} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPatients.map((patient) => (
                    <PatientCard key={patient.id} {...patient} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
