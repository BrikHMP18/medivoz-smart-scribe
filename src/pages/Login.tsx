import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>
      <LoginForm />
    </div>
  );
}
