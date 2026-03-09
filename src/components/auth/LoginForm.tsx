import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { Logo } from "@/components/common/Logo";
import { Loader2, Mail, Lock } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Credenciales invalidas. Verifica tu email y contrasena.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Por favor confirma tu email antes de iniciar sesion.");
        } else {
          toast.error(error.message);
        }
        logger.error("Error during login:", error);
        setIsLoading(false);
        return;
      }

      if (data.user && data.session) {
        toast.success("Inicio de sesion exitoso");
        navigate("/dashboard");
      } else {
        toast.error("Error en la autenticacion. Intenta de nuevo.");
        setIsLoading(false);
      }
    } catch (err) {
      logger.error("Unexpected error during login:", err);
      toast.error("Error al iniciar sesion. Por favor intente de nuevo.");
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
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de vuelta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresa a tu cuenta de Medivoz
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="password" className="text-sm font-medium">Contrasena</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Tu contrasena"
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
                  Iniciando sesion...
                </>
              ) : (
                "Iniciar Sesion"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            No tienes una cuenta?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Registrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
