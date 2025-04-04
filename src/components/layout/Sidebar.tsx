
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Users, Mic, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home
    },
    {
      name: "Pacientes",
      href: "/patients",
      icon: Users
    },
    {
      name: "Sesión",
      href: "/session",
      icon: Mic
    }
  ];
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Sesión cerrada exitosamente");
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  useEffect(() => {
    // Close mobile menu when location changes
    setMobileOpen(false);
  }, [location]);
  
  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 h-16 border-b border-[#3DB7E4]/20 bg-background z-20 flex items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-essalud-blue">EsSalud</span>
          </Link>
          
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="flex flex-col h-full">
                <div className="flex items-center h-16 px-4 border-b border-[#3DB7E4]/20">
                  <Link to="/" className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-essalud-blue">EsSalud</span>
                  </Link>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4">
                  <nav className="grid gap-1 px-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                          location.pathname === item.href
                            ? "bg-essalud-blue text-white"
                            : "hover:bg-essalud-blue/10 text-foreground hover:text-essalud-blue"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
                
                <div className="border-t border-[#3DB7E4]/20 p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="h-16"></div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col border-r border-[#3DB7E4]/20 bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-[#3DB7E4]/20">
        {!collapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-essalud-blue">EsSalud</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="flex items-center mx-auto">
            <span className="text-xl font-bold text-essalud-blue">E</span>
          </Link>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                location.pathname === item.href
                  ? "bg-essalud-blue text-white"
                  : "hover:bg-essalud-blue/10 text-foreground hover:text-essalud-blue"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="border-t border-[#3DB7E4]/20 p-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "→" : "←"}
          {!collapsed && <span className="ml-2">Colapsar</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start mt-2 text-red-500 hover:text-red-600 hover:bg-red-100/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Cerrar Sesión"}
        </Button>
      </div>
    </div>
  );
}
