
import { openai } from "./openai-client.ts";
import { ExtractionResult } from "./types.ts";
import { DEFAULT_MODEL } from "./constants.ts";

// Extract clinical data from transcription
export async function extractClinicalData(transcription: string): Promise<ExtractionResult> {
  console.log("Extracting clinical data from transcription...");
  
  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "Eres un asistente médico especializado en extraer información clínica relevante de transcripciones de consultas médicas. Extrae la información solicitada de manera precisa y concisa."
        },
        {
          role: "user",
          content: `Por favor, extrae la siguiente información clínica de esta transcripción de consulta médica:\n\n${transcription}`
        }
      ],
      functions: [
        {
          name: "extract_clinical_data",
          description: "Extrae datos clínicos estructurados de la transcripción de una consulta médica",
          parameters: {
            type: "object",
            properties: {
              motivo_consulta: {
                type: "string",
                description: "Razón principal por la que el paciente busca atención médica"
              },
              sintomas_principales: {
                type: "string",
                description: "Síntomas más relevantes que el paciente menciona, incluyendo duración, intensidad y factores agravantes o atenuantes"
              },
              antecedentes_relevantes: {
                type: "string",
                description: "Información sobre condiciones médicas previas, alergias, medicamentos actuales o historia familiar relevante"
              },
              notas_adicionales: {
                type: "string",
                description: "Cualquier otra información relevante mencionada en la consulta que no encaje en las categorías anteriores"
              }
            },
            required: ["motivo_consulta", "sintomas_principales"]
          }
        }
      ],
      function_call: { name: "extract_clinical_data" }
    });

    // Parse the function call response
    const functionCall = response.choices[0]?.message?.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error("Failed to extract clinical data");
    }

    // Parse the function arguments as JSON
    const extractedData: ExtractionResult = JSON.parse(functionCall.arguments);
    console.log("Extracted clinical data:", extractedData);
    return {
      motivo_consulta: extractedData.motivo_consulta || "",
      sintomas_principales: extractedData.sintomas_principales || "",
      antecedentes_relevantes: extractedData.antecedentes_relevantes || "",
      notas_adicionales: extractedData.notas_adicionales || ""
    };
  } catch (error) {
    console.error("Error extracting clinical data:", error);
    throw new Error("Failed to extract clinical data: " + error.message);
  }
}
