
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const ProcessSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const steps = [
    "Iniciar sesión con código único",
    "Grabar consulta médica",
    "Revisar transcripción",
    "Ficha médica prellenada"
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-16">Cómo Funciona</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="rounded-2xl overflow-hidden border shadow-lg">
              {currentSlide === 0 && (
                <img 
                  src="https://via.placeholder.com/600x400/0099e6/ffffff?text=Generando+Código+de+Sesión" 
                  alt="Generando código de sesión" 
                  className="w-full h-full object-cover"
                />
              )}
              {currentSlide === 1 && (
                <img 
                  src="https://via.placeholder.com/600x400/0099e6/ffffff?text=Grabando+Consulta" 
                  alt="Grabando consulta" 
                  className="w-full h-full object-cover"
                />
              )}
              {currentSlide === 2 && (
                <img 
                  src="https://via.placeholder.com/600x400/0099e6/ffffff?text=Transcripción+Completa" 
                  alt="Transcripción completa" 
                  className="w-full h-full object-cover"
                />
              )}
              {currentSlide === 3 && (
                <img 
                  src="https://via.placeholder.com/600x400/0099e6/ffffff?text=Ficha+Médica+Prellenada" 
                  alt="Ficha médica prellenada" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-6">Proceso Simplificado</h3>
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-all cursor-pointer ${currentSlide === index ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setCurrentSlide(index)}
                >
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentSlide === index ? 'bg-primary-foreground text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{step}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10">
              <Link to="/signup">
                <Button>Ver Demostración</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
