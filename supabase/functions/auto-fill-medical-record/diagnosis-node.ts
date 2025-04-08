
import { openai } from "./openai-client.ts";
import { ExtractionResult, DiagnosisResult } from "./types.ts";
import { DEFAULT_MODEL, DIAGNOSIS_TIMEOUT } from "./constants.ts";

// Generate diagnosis based on extracted data
export async function generateDiagnosis(extractedData: ExtractionResult): Promise<DiagnosisResult> {
  console.log("Generating diagnosis based on extracted data...");
  
  const prompt = `
    Motivo de consulta: ${extractedData.motivo_consulta}
    Síntomas principales: ${extractedData.sintomas_principales}
    Antecedentes relevantes: ${extractedData.antecedentes_relevantes}
    Notas adicionales: ${extractedData.notas_adicionales}
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "Eres un médico experto en diagnóstico. Basándote en la información clínica proporcionada, genera un diagnóstico principal preciso y conciso."
        },
        {
          role: "user",
          content: `Basándote en la siguiente información clínica, proporciona un diagnóstico principal:\n\n${prompt}`
        }
      ],
      functions: [
        {
          name: "provide_diagnosis",
          description: "Proporciona un diagnóstico principal basado en la información clínica",
          parameters: {
            type: "object",
            properties: {
              diagnostico_principal: {
                type: "string",
                description: "Diagnóstico principal basado en la información clínica proporcionada"
              }
            },
            required: ["diagnostico_principal"]
          }
        }
      ],
      function_call: { name: "provide_diagnosis" },
      timeout: DIAGNOSIS_TIMEOUT
    });

    const functionCall = response.choices[0]?.message?.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error("Failed to generate diagnosis");
    }

    const diagnosisData: DiagnosisResult = JSON.parse(functionCall.arguments);
    console.log("Generated diagnosis:", diagnosisData);
    return {
      diagnostico_principal: diagnosisData.diagnostico_principal || ""
    };
  } catch (error) {
    console.error("Error generating diagnosis:", error);
    throw new Error("Failed to generate diagnosis: " + error.message);
  }
}
