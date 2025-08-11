
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="py-12 border-t">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="text-2xl font-bold text-gradient">Medivoz</div>
            <p className="text-muted-foreground mt-2">© {new Date().getFullYear()} Medivoz. Todos los derechos reservados.</p>
          </div>
          
          <div className="flex gap-8">
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Términos
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacidad
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
