
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export const Logo = ({ collapsed = false, className = "" }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 transition-all hover:scale-105">
          <Activity className="h-5 w-5 text-white" />
        </div>
      </div>
      {!collapsed && (
        <span className="text-xl font-bold tracking-tight text-foreground">
          Medi<span className="text-primary">voz</span>
        </span>
      )}
    </Link>
  );
};

