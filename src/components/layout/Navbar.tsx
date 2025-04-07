
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ThemeToggleButton, ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigate to home page after sign out
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-b-[#3DB7E4]/20 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-essalud-blue dark:text-essalud-light">MEDIVOZ</div>
          </Link>
          
          <div className="hidden md:flex gap-6 items-center">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link to="/" className="transition-colors hover:text-essalud-blue dark:hover:text-essalud-light">
                Inicio
              </Link>
              <ThemeToggle />
            </nav>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button variant="outline">Panel de Control</Button>
                </Link>
                <Button variant="ghost" onClick={handleSignOut} className="gap-2">
                  <LogOut size={16} />
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline">Iniciar Sesión</Button>
                </Link>
                <Link to="/signup">
                  <Button>Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggleButton variant="ghost" />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/" className="text-base hover:text-essalud-blue dark:hover:text-essalud-light">
                    Inicio
                  </Link>
                  <div className="flex items-center pt-2 pb-4">
                    <ThemeToggle />
                  </div>
                  {user ? (
                    <div className="space-y-4 mt-4">
                      <Link to="/dashboard">
                        <Button className="w-full">Panel de Control</Button>
                      </Link>
                      <Button variant="outline" onClick={handleSignOut} className="w-full gap-2">
                        <LogOut size={16} />
                        Cerrar Sesión
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-4">
                      <Link to="/login">
                        <Button variant="outline" className="w-full">Iniciar Sesión</Button>
                      </Link>
                      <Link to="/signup">
                        <Button className="w-full">Registrarse</Button>
                      </Link>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
