
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export const BenefitsSection = () => {
  const benefits = [
    "70% menos tiempo en documentación",
    "Reducción de errores en historiales de 12% a 3%",
    "Aumento de consultas diarias de 18 a 25",
    "Reducción de tiempo por consulta de 22 a 13 minutos",
    "Documentación estandarizada y completa",
    "Recuperación de historiales 37% más rápida"
  ];

  const stats = [
    { value: "70%", label: "Reducción en tiempo de documentación" },
    { value: "99%", label: "Precisión en transcripción" },
    { value: "30%", label: "Más tiempo con pacientes" },
    { value: "1.2M+", label: "Horas recuperables al año" }
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Beneficios Clínicos</h2>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <Link to="/signup">
                <Button className="bg-medivoz-500 hover:bg-medivoz-600">
                  Comenzar Prueba Gratuita
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-medivoz-400 to-medivoz-600 p-1 rounded-2xl">
            <div className="bg-background rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4">Medivoz en Cifras</h3>
              
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-4">
                    <p className="text-4xl font-bold text-medivoz-500">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
