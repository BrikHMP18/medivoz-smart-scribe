
import { extractClinicalData } from "./extraction-node.ts";
import { generateDiagnosis } from "./diagnosis-node.ts";
import { generateTreatmentPlan } from "./treatment-node.ts";
import { ExtractionResult, DiagnosisResult, TreatmentResult, MedicalRecord } from "./types.ts";
import { WORKFLOW_TIMEOUT } from "./constants.ts";

// Aggregate all results
export function aggregateResults(
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

// Main workflow executor
export async function executeWorkflow(transcription: string): Promise<MedicalRecord> {
  try {
    // Set a global timeout for the entire workflow
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Workflow execution timed out")), WORKFLOW_TIMEOUT);
    });

    const workflowPromise = (async () => {
      // Node 1: Extract clinical data
      const extractionResult = await extractClinicalData(transcription);
      
      // Node 2: Generate diagnosis
      const diagnosisResult = await generateDiagnosis(extractionResult);
      
      // Node 3: Generate treatment plan
      const treatmentResult = await generateTreatmentPlan(extractionResult, diagnosisResult);
      
      // Node 4: Aggregate results
      return aggregateResults(extractionResult, diagnosisResult, treatmentResult);
    })();

    // Race the workflow against the timeout
    return await Promise.race([workflowPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error executing workflow:", error);
    throw error;
  }
}
