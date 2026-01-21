
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
      </div>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
