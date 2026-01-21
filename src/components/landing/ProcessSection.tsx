
export const ProcessSection = () => {
  const steps = [
    "Selecciona un paciente de tu lista",
    "Inicia la grabación de la consulta médica",
    "La transcripción se genera automáticamente en tiempo real",
    "La ficha médica se prellena automáticamente con IA"
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[2rem] blur-3xl -z-10"></div>
            <img 
              src="/lovable-uploads/78f5be33-db14-4a1e-9ae4-9090735758a9.png" 
              alt="Interfaz de Medivoz"
              className="w-full h-auto object-contain rounded-2xl shadow-2xl border border-border/50"
            />
          </div>
          
          <div className="space-y-8 order-1 lg:order-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Flujo de Trabajo Simplificado</h2>
              <p className="text-muted-foreground text-lg">Diseñado para ser intuitivo y rápido.</p>
            </div>
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    {index + 1}
                  </div>
                  <div className="pt-2">
                    <p className="text-lg font-medium">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
