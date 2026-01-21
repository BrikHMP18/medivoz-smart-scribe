
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
import { ThemeToggle, ThemeToggleButton } from "@/components/ThemeToggle";
import { Logo } from "@/components/common/Logo";

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
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <Logo />
        
        <div className="hidden md:flex gap-6 items-center">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <ThemeToggle />
          </nav>
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  Panel Principal
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground hover:text-destructive border-border/50">
                <LogOut size={15} />
                <span>Salir</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-medium">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20 hover:opacity-90 transition-all hover:scale-105">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggleButton variant="ghost" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-6 bg-background/95 backdrop-blur-xl border-l border-border/40">
              <nav className="flex flex-col gap-6 mt-8">
                <div className="flex items-center justify-between pb-6 border-b border-border/40">
                   <span className="text-lg font-semibold">Menú</span>
                   <ThemeToggle />
                </div>
                
                <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">
                  Inicio
                </Link>
                
                {user ? (
                  <div className="space-y-4 mt-auto pt-8 border-t border-border/40">
                    <Link to="/dashboard">
                      <Button className="w-full justify-start" size="lg">Panel de Control</Button>
                    </Link>
                    <Button variant="outline" onClick={handleSignOut} className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" size="lg">
                      <LogOut size={18} />
                      Cerrar Sesión
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mt-4">
                    <Link to="/login">
                      <Button variant="outline" className="w-full justify-start h-12 text-base font-medium">Iniciar Sesión</Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="w-full justify-start h-12 text-base font-medium shadow-lg shadow-primary/10">Registrarse Gratis</Button>
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
