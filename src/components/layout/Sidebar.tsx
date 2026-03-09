import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Users, Mic, LogOut, Menu, Cpu, ChevronLeft, ChevronRight, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/utils/logger";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggleButton } from "@/components/ThemeToggle";
import { Logo } from "@/components/common/Logo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Pacientes", href: "/patients", icon: Users },
    { name: "Sesion", href: "/session", icon: Mic },
    { name: "Historial", href: "/history", icon: History },
    { name: "Agentes", href: "/agents", icon: Cpu },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      logger.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const NavLink = ({ item, mobile = false }: { item: (typeof navItems)[0]; mobile?: boolean }) => {
    const isActive = location.pathname === item.href;
    const link = (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 text-[13px] font-medium relative group",
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={mobile ? () => setMobileOpen(false) : undefined}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
        )}
        <item.icon className={cn("h-[18px] w-[18px] shrink-0", collapsed && !mobile && "mx-auto")} />
        {(!collapsed || mobile) && <span>{item.name}</span>}
      </Link>
    );

    if (collapsed && !mobile) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 h-14 border-b border-border/50 bg-background/90 backdrop-blur-md z-40 flex items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-1">
            <ThemeToggleButton variant="ghost" size="sm" />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-background">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between h-14 px-5 border-b border-border/50">
                    <Logo />
                    <ThemeToggleButton variant="ghost" size="sm" />
                  </div>
                  <div className="flex-1 overflow-y-auto py-4 px-3">
                    <nav className="grid gap-1">
                      {navItems.map((item) => (
                        <NavLink key={item.href} item={item} mobile />
                      ))}
                    </nav>
                  </div>
                  <div className="border-t border-border/50 p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-[13px]"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesion
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="h-14" />
      </>
    );
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "h-screen fixed left-0 top-0 z-40 flex flex-col border-r border-border/50 bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className={cn(
          "flex items-center h-14 border-b border-border/50",
          collapsed ? "justify-center px-2" : "justify-between px-5"
        )}>
          <Logo collapsed={collapsed} />
          {!collapsed && (
            <ThemeToggleButton variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2">
          <nav className="grid gap-0.5">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>

        <div className="border-t border-border/50 p-2 space-y-0.5">
          {collapsed && (
            <ThemeToggleButton
              variant="ghost"
              size="icon"
              className="w-full h-9 text-muted-foreground"
            />
          )}

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full h-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground text-[13px]",
              collapsed ? "justify-center px-0" : "justify-start px-3"
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4 mr-2" />}
            {!collapsed && <span className="text-xs uppercase tracking-wider font-medium">Ocultar</span>}
          </Button>

          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-[13px]",
                  collapsed ? "justify-center px-0" : "justify-start px-3"
                )}
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Salir</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={8} className="text-xs">
                Cerrar Sesion
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
