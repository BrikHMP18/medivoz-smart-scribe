
import { Mic, FileText, ClipboardEdit, HeartPulse } from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: React.ElementType;
};

export const FeaturesSection = () => {
  const features: Feature[] = [
    {
      title: "Transcripción en Vivo",
      description: "Conversión automática de consultas médicas a texto estructurado en tiempo real.",
      icon: Mic
    },
    {
      title: "Formato de Conversación",
      description: "Distingue entre voces con marcas de tiempo para una mejor navegación clínica.",
      icon: FileText
    },
    {
      title: "Prellenado de Fichas",
      description: "Genera fichas médicas digitales con la información relevante de la consulta.",
      icon: ClipboardEdit
    },
    {
      title: "Consultas Eficientes",
      description: "Reduce el tiempo administrativo para una atención médica más enfocada.",
      icon: HeartPulse
    }
  ];

  return (
    <section id="features" className="py-20">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Características</h2>
          <p className="text-muted-foreground">Herramientas diseñadas para optimizar tu flujo de trabajo médico.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group p-6 rounded-2xl bg-background hover:bg-muted/50 transition-colors duration-300">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
