
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

  // Use reliable image sources instead of placeholder.com
  const slideImages = [
    "/placeholder.svg", // Using the local placeholder.svg in public folder
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg"
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-16">Cómo Funciona</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="rounded-2xl overflow-hidden border shadow-lg bg-medivoz-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <h3 className="text-xl font-bold text-medivoz-700 mb-2">
                    {currentSlide === 0 && "Generando Código de Sesión"}
                    {currentSlide === 1 && "Grabando Consulta"}
                    {currentSlide === 2 && "Transcripción Completa"}
                    {currentSlide === 3 && "Ficha Médica Prellenada"}
                  </h3>
                </div>
              </div>
              <img 
                src={slideImages[currentSlide]} 
                alt={steps[currentSlide]} 
                className="w-full h-64 object-contain opacity-30"
              />
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
