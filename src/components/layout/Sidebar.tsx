import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Users, Mic, LogOut, Menu, Cpu, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggleButton } from "@/components/ThemeToggle";
import { Logo } from "@/components/common/Logo";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  
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
    },
    {
      name: "Agentes",
      href: "/agents",
      icon: Cpu
    }
  ];
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);
  
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 h-16 border-b border-border/40 bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-4">
          <Logo />
          
          <div className="flex items-center gap-2">
            <ThemeToggleButton variant="ghost" size="sm" />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-background">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between h-16 px-6 border-b border-border/40">
                    <Logo />
                    <ThemeToggleButton variant="ghost" size="sm" />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto py-6 px-3">
                    <nav className="grid gap-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 font-medium text-sm",
                            location.pathname === item.href
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                          onClick={() => setMobileOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                  
                  <div className="border-t border-border/40 p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
        </div>
        <div className="h-16"></div>
      </>
    );
  }

  return (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 shadow-sm",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn(
        "flex items-center h-20 border-b border-border/40",
        collapsed ? "justify-center px-0" : "justify-between px-6"
      )}>
        <Logo collapsed={collapsed} />
        {!collapsed && (
          <ThemeToggleButton variant="ghost" size="icon" className="h-8 w-8" />
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="grid gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 font-medium text-sm group relative",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", collapsed && "mx-auto")} />
              {!collapsed && <span>{item.name}</span>}
              {collapsed && location.pathname === item.href && (
                 <span className="absolute inset-y-0 left-0 w-1 bg-primary-foreground rounded-r-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="border-t border-border/40 p-4 space-y-2">
        {collapsed && (
          <ThemeToggleButton 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10 mb-2 mx-auto flex items-center justify-center"
          />
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full hover:bg-muted transition-colors", collapsed ? "justify-center px-0" : "justify-start px-2")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4 mr-2" />}
          {!collapsed && <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Ocultar</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors", 
            collapsed ? "justify-center px-0" : "justify-start px-2"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Salir</span>}
        </Button>
      </div>
    </div>
  );
}
