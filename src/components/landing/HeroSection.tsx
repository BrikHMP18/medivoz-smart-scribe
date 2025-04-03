
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="py-20 md:py-32 container">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in">
          <span className="text-gradient">MEDIVOZ</span>
          <br/>
          <span className="text-4xl md:text-5xl">Escriba Inteligente</span>
        </h1>
        
        <p className="mt-6 text-xl text-muted-foreground max-w-2xl">
          Transcripción inteligente de consultas médicas y generación automática de fichas clínicas con IA para sistemas de salud altamente demandados.
        </p>
        
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link to="/signup">
            <Button size="lg" className="bg-medivoz-500 hover:bg-medivoz-600">
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <Link to="/login">
            <Button size="lg" variant="outline">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
