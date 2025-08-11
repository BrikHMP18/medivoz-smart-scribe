
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const CtaSection = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-medivoz-600 to-medivoz-800 text-white">
      <div className="container text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para transformar tus consultas médicas?</h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
          Medivoz permite a los médicos reducir la carga documental, optimizar tiempos y mejorar la atención en sistemas de salud saturados.
        </p>
        <Link to="/signup">
          <Button size="lg" variant="secondary" className="font-medium">
            Registrarse Ahora
          </Button>
        </Link>
      </div>
    </section>
  );
};
