
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
      description: "Distingue entre voces con marcas de tiempo para mejor navegación clínica.",
      icon: FileText
    },
    {
      title: "Prellenado de Fichas",
      description: "Genera fichas médicas digitales con la información relevante de la consulta.",
      icon: ClipboardEdit
    },
    {
      title: "Consultas Eficientes",
      description: "Reduce tiempo administrativo para una atención médica más enfocada.",
      icon: HeartPulse
    }
  ];

  return (
    <section id="features" className="py-20">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-16">Características Principales</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 border rounded-lg bg-card hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
