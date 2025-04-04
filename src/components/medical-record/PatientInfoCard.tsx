
import { UserRound } from "lucide-react";

interface PatientInfoCardProps {
  name: string;
  age: number | null;
  occupation: string | null;
  location: string | null;
}

export function PatientInfoCard({ name, age, occupation, location }: PatientInfoCardProps) {
  return (
    <div className="bg-primary-50 border border-primary-100 rounded-md p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <UserRound className="h-5 w-5 text-primary" />
        <h4 className="font-semibold text-primary-900">Información del Paciente</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div className="flex">
          <span className="font-medium w-24">Nombre:</span>
          <span>{name}</span>
        </div>
        
        <div className="flex">
          <span className="font-medium w-24">Edad:</span>
          <span>{age !== null ? `${age} años` : "No especificada"}</span>
        </div>
        
        <div className="flex">
          <span className="font-medium w-24">Ocupación:</span>
          <span>{occupation || "No especificada"}</span>
        </div>
        
        <div className="flex">
          <span className="font-medium w-24">Procedencia:</span>
          <span>{location || "No especificada"}</span>
        </div>
      </div>
    </div>
  );
}
