
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Users, Mic, LogOut } from "lucide-react";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
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
  
  return (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b">
        {!collapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gradient">MEDIVOZ</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="flex items-center mx-auto">
            <span className="text-xl font-bold text-medivoz-500">M</span>
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
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="border-t p-4">
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
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Cerrar Sesión"}
        </Button>
      </div>
    </div>
  );
}
