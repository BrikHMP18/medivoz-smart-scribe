
/**
 * Determina el mejor tipo MIME de audio compatible con el navegador
 * @returns El mejor tipo MIME compatible o cadena vacía si ninguno es compatible
 */
export const getBestSupportedMimeType = (): string => {
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    'audio/mpeg'
  ];
  
  for (const type of mimeTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log("Usando tipo MIME:", type);
      return type;
    }
  }
  
  console.warn("No se encontraron tipos MIME compatibles, usando el predeterminado del navegador");
  return '';  // Dejar que el navegador elija el predeterminado
};

/**
 * Crea un listener seguro para elementos de audio que se puede eliminar correctamente
 * @param handler - La función manejadora de eventos
 * @returns Una función que se puede usar como listener de eventos
 */
export const createSafeAudioErrorListener = (handler: (error: MediaError | null) => void) => {
  return (event: Event) => {
    const audioElement = event.target as HTMLAudioElement;
    handler(audioElement.error);
  };
};
