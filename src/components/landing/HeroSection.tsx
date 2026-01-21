import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
export const HeroSection = () => {
  return <section className="py-20 md:py-28 container">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
          Nueva versión disponible
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-medivoz-500 to-medivoz-700 bg-clip-text text-transparent">
            Medivoz
          </span>
          <span className="block mt-2 text-3xl md:text-5xl text-foreground font-medium">Escriba Inteligente</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-light">
          Agentes de IA para transcripción inteligente y llenado automático de fichas clínicas.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-8 py-6 text-base h-auto shadow-lg shadow-medivoz-500/20 hover:shadow-medivoz-500/30 transition-all">
              Comenzar Ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          <Link to="/login">
            <Button size="lg" variant="ghost" className="w-full sm:w-auto rounded-full px-8 py-6 text-base h-auto hover:bg-muted/50">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    </section>;
};