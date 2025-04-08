
import { openai } from "./openai-client.ts";
import { ExtractionResult, DiagnosisResult, TreatmentResult } from "./types.ts";
import { DEFAULT_MODEL, TREATMENT_TIMEOUT } from "./constants.ts";

// Generate treatment plan based on diagnosis and extracted data
export async function generateTreatmentPlan(
  extractedData: ExtractionResult, 
  diagnosisResult: DiagnosisResult
): Promise<TreatmentResult> {
  console.log("Generating treatment plan...");
  
  const prompt = `
    Motivo de consulta: ${extractedData.motivo_consulta}
    Síntomas principales: ${extractedData.sintomas_principales}
    Antecedentes relevantes: ${extractedData.antecedentes_relevantes}
    Diagnóstico principal: ${diagnosisResult.diagnostico_principal}
    Notas adicionales: ${extractedData.notas_adicionales}
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "Eres un médico evaluado con experiencia en crear planes de tratamiento. Basándote en la información clínica y el diagnóstico proporcionados, genera un plan de tratamiento detallado y efectivo."
        },
        {
          role: "user",
          content: `Basándote en la siguiente información clínica y diagnóstico, proporciona un plan de tratamiento detallado:\n\n${prompt}`
        }
      ],
      functions: [
        {
          name: "provide_treatment_plan",
          description: "Proporciona un plan de tratamiento basado en la información clínica y el diagnóstico",
          parameters: {
            type: "object",
            properties: {
              plan_tratamiento: {
                type: "string",
                description: "Plan de tratamiento detallado basado en la información clínica y el diagnóstico proporcionados"
              }
            },
            required: ["plan_tratamiento"]
          }
        }
      ],
      function_call: { name: "provide_treatment_plan" },
      timeout: TREATMENT_TIMEOUT
    });

    const functionCall = response.choices[0]?.message?.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error("Failed to generate treatment plan");
    }

    const treatmentData: TreatmentResult = JSON.parse(functionCall.arguments);
    console.log("Generated treatment plan:", treatmentData);
    return {
      plan_tratamiento: treatmentData.plan_tratamiento || ""
    };
  } catch (error) {
    console.error("Error generating treatment plan:", error);
    throw new Error("Failed to generate treatment plan: " + error.message);
  }
}
