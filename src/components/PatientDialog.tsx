
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { PatientFormFields } from "@/components/patients/PatientFormFields";
import { PatientDialogActions } from "@/components/patients/PatientDialogActions";
import { 
  patientFormSchema, 
  PatientFormValues, 
  Patient, 
  PatientDialogMode 
} from "@/components/patients/PatientDialogTypes";

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  patient?: Patient | null;
  mode?: PatientDialogMode;
}

export function PatientDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  patient, 
  mode = 'create' 
}: PatientDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = mode === 'edit';
  
  // Initialize form
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      nombre: "",
      dni: "",
      edad: null,
      ocupacion: "",
      procedencia: "",
      diagnostico: "",
    },
  });
  
  // Update form values when editing a patient
  useEffect(() => {
    if (isEditing && patient) {
      form.reset({
        nombre: patient.nombre,
        dni: patient.dni,
        edad: patient.edad,
        ocupacion: patient.ocupacion || "",
        procedencia: patient.procedencia || "",
        diagnostico: patient.diagnostico || "",
      });
    } else if (!isEditing) {
      form.reset({
        nombre: "",
        dni: "",
        edad: null,
        ocupacion: "",
        procedencia: "",
        diagnostico: "",
      });
    }
  }, [isEditing, patient, form, open]);
  
  const onSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && patient) {
        // Update existing patient
        const { error } = await supabase.from('pacientes')
          .update({
            nombre: data.nombre,
            dni: data.dni,
            edad: data.edad,
            ocupacion: data.ocupacion || null,
            procedencia: data.procedencia || null,
            diagnostico: data.diagnostico || null,
          })
          .eq('id', patient.id);
        
        if (error) {
          throw error;
        }
        
        toast.success("Paciente actualizado correctamente");
      } else {
        // Create new patient with current doctor
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Usuario no autenticado");
        }

        const { error } = await supabase.from('pacientes').insert([{
          nombre: data.nombre,
          dni: data.dni,
          edad: data.edad,
          ocupacion: data.ocupacion || null,
          procedencia: data.procedencia || null,
          diagnostico: data.diagnostico || null,
          doctor_id: user.id,
        }]);
        
        if (error) {
          throw error;
        }
        
        toast.success("Paciente registrado correctamente");
      }
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error(`Error ${isEditing ? 'actualizando' : 'registrando'} paciente:`, error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'registrar'} paciente`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Actualice los datos del paciente seleccionado.'
              : 'Complete los datos del paciente. Solo nombre y DNI son obligatorios.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PatientFormFields form={form} />
            
            <PatientDialogActions 
              isSubmitting={isSubmitting} 
              isEditing={isEditing} 
              onCancel={() => onOpenChange(false)} 
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
