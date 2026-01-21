
import { CheckCircle } from "lucide-react";

export const BenefitsSection = () => {
  const benefits = [
    "70% menos tiempo en documentación",
    "Reducción de errores en historiales de 12% a 3%",
    "Aumento de consultas diarias de 18 a 25",
    "Reducción de tiempo por consulta de 12 a 7 minutos",
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
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Impacto Real</h2>
              <p className="text-lg text-muted-foreground">Resultados medibles en la eficiencia de tu práctica médica.</p>
            </div>
            
            <div className="space-y-3">
              {benefits.slice(0, 4).map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-1 rounded-full p-1 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  </div>
                  <p className="text-base font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/20 transition-colors">
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
