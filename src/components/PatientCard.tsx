
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, Edit, Trash } from "lucide-react";

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  diagnosis?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PatientCard({ 
  id, 
  name, 
  age, 
  lastVisit, 
  diagnosis, 
  onEdit, 
  onDelete 
}: PatientCardProps) {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:border-muted/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-essalud-blue/10 dark:bg-essalud-blue/20 flex items-center justify-center text-essalud-blue dark:text-essalud-light font-bold text-lg">
            {name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="font-medium text-lg">{name}</div>
            <div className="text-sm text-muted-foreground">
              {age > 0 ? `${age} años` : "Edad no especificada"}
            </div>
            {diagnosis && (
              <div className="mt-2 text-sm">
                <span className="font-medium">Diagnóstico:</span> {diagnosis}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/40 dark:bg-muted/10 flex-col space-y-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Última visita: {lastVisit}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button 
                size="sm" 
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  onEdit();
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                size="sm" 
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete();
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <Link to={`/session?patientId=${id}`} className="w-full">
          <Button size="sm" variant="outline" className="w-full">
            Nueva sesión
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
