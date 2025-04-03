
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  diagnosis?: string;
}

export function PatientCard({ id, name, age, lastVisit, diagnosis }: PatientCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-medivoz-100 flex items-center justify-center text-medivoz-600 font-bold text-lg">
            {name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="font-medium text-lg">{name}</div>
            <div className="text-sm text-muted-foreground">
              {age} años
            </div>
            {diagnosis && (
              <div className="mt-2 text-sm">
                <span className="font-medium">Diagnóstico:</span> {diagnosis}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/40 flex items-center justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          Última visita: {lastVisit}
        </div>
        <Link to={`/session?patientId=${id}`}>
          <Button size="sm" variant="outline">
            Nueva sesión
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
