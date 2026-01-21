
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
          description: "Extrae los campos subjetivos principales de una historia clínica",
          parameters: {
            type: "object",
            properties: {
              motivo_consulta: {
                type: "string",
                description: "Motivo principal expresado por el paciente"
              },
              tiempo_enfermedad: {
                type: "string",
                description: "Tiempo de evolución o duración de la enfermedad desde el inicio de los síntomas"
              },
              forma_inicio: {
                type: "string",
                description: "Modo de inicio de la enfermedad (repentino, insidioso, etc.)"
              },
              curso_enfermedad: {
                type: "string",
                description: "Forma de evolución o progresión de la enfermedad"
              },
              historia_cronologica: {
                type: "string",
                description: "Descripción detallada y cronológica de la enfermedad actual con síntomas relevantes"
              },
              antecedentes: {
                type: "string",
                description: "Antecedentes personales, familiares, comorbilidades o RAM relevantes"
              },
              estado_funcional_basal: {
                type: "string",
                description: "Descripción del nivel de autonomía o funcionalidad previa del paciente"
              },
              estudios_previos: {
                type: "string",
                description: "Exámenes, pruebas o estudios mencionados anteriormente"
              },
              sintomas_principales: {
                type: "string",
                description: "Resumen de los síntomas destacados mencionados en la consulta"
              },
              notas_adicionales: {
                type: "string",
                description: "Observaciones complementarias que no encajan en las categorías anteriores"
              }
            },
            required: [
              "motivo_consulta",
              "tiempo_enfermedad",
              "forma_inicio",
              "curso_enfermedad",
              "historia_cronologica",
              "antecedentes"
            ]
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
    const extractedData = JSON.parse(functionCall.arguments) as Partial<ExtractionResult>;
    console.log("Extracted clinical data:", extractedData);
    return {
      motivo_consulta: extractedData.motivo_consulta || "",
      tiempo_enfermedad: extractedData.tiempo_enfermedad || "",
      forma_inicio: extractedData.forma_inicio || "",
      curso_enfermedad: extractedData.curso_enfermedad || "",
      historia_cronologica: extractedData.historia_cronologica || "",
      antecedentes: extractedData.antecedentes || "",
      sintomas_principales: extractedData.sintomas_principales || "",
      estado_funcional_basal: extractedData.estado_funcional_basal || "",
      estudios_previos: extractedData.estudios_previos || "",
      notas_adicionales: extractedData.notas_adicionales || ""
    };
  } catch (error) {
    console.error("Error extracting clinical data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Failed to extract clinical data: " + errorMessage);
  }
}
