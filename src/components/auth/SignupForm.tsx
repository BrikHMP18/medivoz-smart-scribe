import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { Logo } from "@/components/common/Logo";
import { Loader2, Mail, Lock, User, Stethoscope } from "lucide-react";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = window.location.origin;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
            specialty: specialty,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("Este email ya esta registrado. Intenta iniciar sesion.");
        } else if (error.message.includes("Password should be")) {
          toast.error("La contrasena debe tener al menos 6 caracteres.");
        } else {
          toast.error(error.message);
        }
        logger.error("Error during signup:", error);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          toast.success("Registro exitoso. Bienvenido!");
          navigate("/dashboard");
        } else {
          toast.success("Registro exitoso. Revisa tu email para confirmar tu cuenta.");
          navigate("/login");
        }
      } else {
        toast.error("Error en el registro. Intenta de nuevo.");
        setIsLoading(false);
      }
    } catch (err) {
      logger.error("Unexpected error during signup:", err);
      toast.error("Error al registrarse. Por favor intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/30 p-4">
      <div className="w-full max-w-[420px]">
        <div className="bg-card rounded-2xl border border-border/60 shadow-xl shadow-primary/5 p-8">
          <div className="flex flex-col items-center mb-8">
            <Logo className="mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Crear Cuenta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Registrate en Medivoz para comenzar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Dr. Juan Perez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-sm font-medium">Especialidad</Label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="specialty"
                  placeholder="Neurologia, Pediatria, etc."
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Contrasena</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 font-medium text-sm mt-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Inicia Sesion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
