
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const CtaSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5"></div>
      <div className="container text-center relative z-10 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tight mb-4">Comienza a transformar tu práctica</h2>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Únete a los profesionales que ya están optimizando sus consultas médicas con IA.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-10 py-7 text-lg h-auto shadow-xl hover:translate-y-[-2px] transition-all duration-300">
              Comenzar Prueba Gratuita
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
