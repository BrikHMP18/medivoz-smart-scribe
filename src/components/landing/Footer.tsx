
export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/40 bg-muted/10">
      <div className="container">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="text-xl font-bold bg-gradient-to-r from-medivoz-500 to-medivoz-700 bg-clip-text text-transparent">Medivoz</div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Medivoz. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
