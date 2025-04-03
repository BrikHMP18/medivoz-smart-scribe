
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { 
  Mic, 
  FileText, 
  ClipboardEdit, 
  HeartPulse, 
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Index() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const features = [
    {
      title: "Transcripción en Vivo",
      description: "Convierte automáticamente conversaciones entre doctor y paciente en texto en tiempo real.",
      icon: Mic
    },
    {
      title: "Formato de Conversación",
      description: "Distingue automáticamente entre la voz del doctor y del paciente con marcas de tiempo.",
      icon: FileText
    },
    {
      title: "Prellenado de Fichas",
      description: "Genera fichas médicas digitales prellenadas con información extraída de la conversación.",
      icon: ClipboardEdit
    },
    {
      title: "Consultas Eficientes",
      description: "Reduce el tiempo dedicado a documentación y aumenta la calidad de atención al paciente.",
      icon: HeartPulse
    }
  ];

  const steps = [
    "Iniciar una sesión con código único",
    "Grabar la consulta médica",
    "Revisión de la transcripción",
    "Ficha médica prellenada automáticamente"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 md:py-32 container">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in">
            <span className="text-gradient">MEDIVOZ</span>
            <br/>
            <span className="text-4xl md:text-5xl">Smart Scribe</span>
          </h1>
          
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl">
            Transcripción inteligente de consultas médicas y generación automática de fichas clínicas para médicos modernos.
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-medivoz-500 hover:bg-medivoz-600">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/login">
              <Button size="lg" variant="outline">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Preview Section */}
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
                  <Button>Ver Demostración Completa</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
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
      
      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Beneficios Clínicos</h2>
              
              <div className="space-y-4">
                {[
                  "Reducción del 70% en tiempo de documentación clínica",
                  "Mejora en la precisión de historias clínicas",
                  "Mayor tiempo de interacción con el paciente",
                  "Documentación estandarizada y completa",
                  "Acceso rápido a información relevante del paciente"
                ].map((benefit, index) => (
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
                <h3 className="text-xl font-bold mb-4">MEDIVOZ en Cifras</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4">
                    <p className="text-4xl font-bold text-medivoz-500">70%</p>
                    <p className="text-sm text-muted-foreground mt-2">Reducción en tiempo de documentación</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-4xl font-bold text-medivoz-500">99%</p>
                    <p className="text-sm text-muted-foreground mt-2">Precisión en transcripción</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-4xl font-bold text-medivoz-500">30%</p>
                    <p className="text-sm text-muted-foreground mt-2">Más tiempo con pacientes</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-4xl font-bold text-medivoz-500">12M+</p>
                    <p className="text-sm text-muted-foreground mt-2">Horas ahorradas al año</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-medivoz-600 to-medivoz-800 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para transformar tus consultas médicas?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Únete a miles de profesionales de la salud que ya están usando MEDIVOZ para optimizar su práctica clínica.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="font-medium">
              Registrarse Ahora
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-2xl font-bold text-gradient">MEDIVOZ</div>
              <p className="text-muted-foreground mt-2">© {new Date().getFullYear()} MEDIVOZ. Todos los derechos reservados.</p>
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
    </div>
  );
}
