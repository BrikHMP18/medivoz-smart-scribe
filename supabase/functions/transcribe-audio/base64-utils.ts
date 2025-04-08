
/**
 * Utility functions for processing base64 data
 */

/**
 * Process base64 in chunks to prevent memory issues
 * @param base64String - The base64 string to process
 * @param chunkSize - Size of each chunk (default: 32768)
 * @returns Processed Uint8Array
 */
export function processBase64Chunks(base64String: string, chunkSize = 32768): Uint8Array {
  if (!base64String) {
    console.error("No base64 string provided to processBase64Chunks");
    return new Uint8Array(0);
  }

  try {
    const chunks: Uint8Array[] = [];
    let position = 0;
    
    while (position < base64String.length) {
      const chunk = base64String.slice(position, position + chunkSize);
      const binaryChunk = atob(chunk);
      const bytes = new Uint8Array(binaryChunk.length);
      
      for (let i = 0; i < binaryChunk.length; i++) {
        bytes[i] = binaryChunk.charCodeAt(i);
      }
      
      chunks.push(bytes);
      position += chunkSize;
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  } catch (error) {
    console.error("Error processing base64 chunks:", error);
    throw new Error(`Error processing audio data: ${error.message}`);
  }
}
