
interface StatusIndicatorProps {
  isLoaded: boolean;
  isPlaying: boolean;
}

export function StatusIndicator({ isLoaded, isPlaying }: StatusIndicatorProps) {
  return (
    <div className="text-center mt-2">
      <span className="text-sm text-primary font-medium dark:text-primary/90">
        {!isLoaded ? "Cargando audio..." : 
          isPlaying ? "Reproduciendo..." : "Listo para reproducir"}
      </span>
    </div>
  );
}
