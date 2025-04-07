
/**
 * Utilidades para manejo y conversión de blobs
 */

/**
 * Convierte un Blob a cadena base64
 * @param blob - El blob de audio a convertir
 * @returns Una promesa que se resuelve a una cadena base64
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Eliminar prefijo de URL de datos
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("El resultado de FileReader no es una cadena"));
      }
    };
    reader.onerror = (event) => {
      console.error("Error de FileReader:", reader.error);
      reject(new Error("Error de FileReader: " + (reader.error?.message || "Error desconocido")));
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Valida un blob de audio
 * @param blob - El blob de audio a validar
 * @returns True si el blob es válido, false en caso contrario
 */
export const validateAudioBlob = (blob: Blob | null): boolean => {
  if (!blob) {
    console.error("El blob de audio es nulo");
    return false;
  }
  
  if (blob.size === 0) {
    console.error("El tamaño del blob de audio es 0");
    return false;
  }
  
  // Comprobar si el tipo MIME es válido
  const validTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/wav',
    'audio/mpeg'
  ];
  
  // Registrar pero no invalidar por tipo MIME desconocido
  if (!validTypes.some(type => blob.type.startsWith(type.split(';')[0])) && blob.type !== '') {
    console.log(`Formato de audio detectado: ${blob.type}. Continuando de todos modos.`);
  }
  
  console.log(`Blob de audio validado: ${blob.size} bytes, tipo: ${blob.type}`);
  return true;
};

/**
 * Crea una URL de blob a partir de un blob
 * @param blob - El blob para el que crear una URL
 * @returns La URL creada o null si el blob no es válido
 */
export const createBlobURL = (blob: Blob | null): string | null => {
  if (!validateAudioBlob(blob)) {
    return null;
  }
  
  const url = URL.createObjectURL(blob);
  console.log("URL de audio creada:", url);
  return url;
};

/**
 * Revoca una URL de blob
 * @param url - La URL a revocar
 */
export const revokeBlobURL = (url: string | null): void => {
  if (url) {
    try {
      URL.revokeObjectURL(url);
      console.log("URL de audio revocada:", url);
    } catch (error) {
      console.error("Error al revocar URL:", error);
    }
  }
};
