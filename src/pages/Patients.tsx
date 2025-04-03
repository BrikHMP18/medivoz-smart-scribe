
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  
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
          <header className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Pacientes</h1>
              <p className="text-muted-foreground">Gestiona la información de los pacientes</p>
            </div>
            <Button className="bg-medivoz-500 hover:bg-medivoz-600">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Paciente
            </Button>
          </header>
          
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Pacientes</CardTitle>
                <div className="flex items-center w-64">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <Input
                    placeholder="Buscar paciente..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="cursor-pointer hover:bg-muted">
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>{patient.diagnosis}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
