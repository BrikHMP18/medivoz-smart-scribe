
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-medivoz-400 to-medivoz-600 text-transparent bg-clip-text">MEDIVOZ</div>
          </Link>
          
          <div className="hidden md:flex gap-6 items-center">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link to="/" className="transition-colors hover:text-foreground/80">
                Inicio
              </Link>
            </nav>
            
            {isSignedIn ? (
              <Link to="/dashboard">
                <Button>Panel de Control</Button>
              </Link>
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
          
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/" className="text-base">
                    Inicio
                  </Link>
                  {isSignedIn ? (
                    <Link to="/dashboard">
                      <Button className="w-full">Panel de Control</Button>
                    </Link>
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
