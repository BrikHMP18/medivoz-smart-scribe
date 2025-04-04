
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

// Define the types for our workflow
interface ExtractionResult {
  motivo_consulta: string;
  sintomas_principales: string;
  antecedentes_relevantes: string;
  notas_adicionales: string;
}

interface DiagnosisResult {
  diagnostico_principal: string;
}

interface TreatmentResult {
  plan_tratamiento: string;
}

interface MedicalRecord extends ExtractionResult, DiagnosisResult, TreatmentResult {}

// LangGraph-inspired workflow implementation
const workflowNodes = {
  // Extract clinical data from transcription
  async extractClinicalData(transcription: string): Promise<ExtractionResult> {
    console.log("Extracting clinical data from transcription...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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

    try {
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
      console.error("Error parsing extracted data:", error);
      throw new Error("Failed to parse extracted clinical data");
    }
  },

  // Generate diagnosis based on extracted data
  async generateDiagnosis(extractedData: ExtractionResult): Promise<DiagnosisResult> {
    console.log("Generating diagnosis based on extracted data...");
    
    const prompt = `
      Motivo de consulta: ${extractedData.motivo_consulta}
      Síntomas principales: ${extractedData.sintomas_principales}
      Antecedentes relevantes: ${extractedData.antecedentes_relevantes}
      Notas adicionales: ${extractedData.notas_adicionales}
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
      function_call: { name: "provide_diagnosis" }
    });

    const functionCall = response.choices[0]?.message?.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error("Failed to generate diagnosis");
    }

    try {
      const diagnosisData: DiagnosisResult = JSON.parse(functionCall.arguments);
      console.log("Generated diagnosis:", diagnosisData);
      return {
        diagnostico_principal: diagnosisData.diagnostico_principal || ""
      };
    } catch (error) {
      console.error("Error parsing diagnosis data:", error);
      throw new Error("Failed to parse diagnosis data");
    }
  },

  // Generate treatment plan based on diagnosis and extracted data
  async generateTreatmentPlan(extractedData: ExtractionResult, diagnosisResult: DiagnosisResult): Promise<TreatmentResult> {
    console.log("Generating treatment plan...");
    
    const prompt = `
      Motivo de consulta: ${extractedData.motivo_consulta}
      Síntomas principales: ${extractedData.sintomas_principales}
      Antecedentes relevantes: ${extractedData.antecedentes_relevantes}
      Diagnóstico principal: ${diagnosisResult.diagnostico_principal}
      Notas adicionales: ${extractedData.notas_adicionales}
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
      function_call: { name: "provide_treatment_plan" }
    });

    const functionCall = response.choices[0]?.message?.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error("Failed to generate treatment plan");
    }

    try {
      const treatmentData: TreatmentResult = JSON.parse(functionCall.arguments);
      console.log("Generated treatment plan:", treatmentData);
      return {
        plan_tratamiento: treatmentData.plan_tratamiento || ""
      };
    } catch (error) {
      console.error("Error parsing treatment data:", error);
      throw new Error("Failed to parse treatment data");
    }
  },

  // Aggregate all results
  aggregateResults(
    extractionResult: ExtractionResult,
    diagnosisResult: DiagnosisResult,
    treatmentResult: TreatmentResult
  ): MedicalRecord {
    return {
      ...extractionResult,
      ...diagnosisResult,
      ...treatmentResult
    };
  }
};

// Main workflow executor
async function executeWorkflow(transcription: string): Promise<MedicalRecord> {
  try {
    // Node 1: Extract clinical data
    const extractionResult = await workflowNodes.extractClinicalData(transcription);
    
    // Node 2: Generate diagnosis
    const diagnosisResult = await workflowNodes.generateDiagnosis(extractionResult);
    
    // Node 3: Generate treatment plan
    const treatmentResult = await workflowNodes.generateTreatmentPlan(extractionResult, diagnosisResult);
    
    // Node 4: Aggregate results
    return workflowNodes.aggregateResults(extractionResult, diagnosisResult, treatmentResult);
  } catch (error) {
    console.error("Error executing workflow:", error);
    throw error;
  }
}

// Handle incoming requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription } = await req.json();
    
    if (!transcription) {
      return new Response(
        JSON.stringify({ error: "Transcription is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing transcription:", transcription.substring(0, 100) + "...");
    
    // Execute the workflow
    const medicalRecord = await executeWorkflow(transcription);
    
    // Return the generated medical record
    return new Response(
      JSON.stringify({ medicalRecord }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
