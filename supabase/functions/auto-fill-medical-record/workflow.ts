
import { extractClinicalData } from "./extraction-node.ts";
import { MedicalRecord } from "./types.ts";
import { WORKFLOW_TIMEOUT } from "./constants.ts";

// Main workflow executor
export async function executeWorkflow(transcription: string): Promise<MedicalRecord> {
  try {
    // Set a global timeout for the entire workflow
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Workflow execution timed out")), WORKFLOW_TIMEOUT);
    });

    const workflowPromise = (async () => {
      return await extractClinicalData(transcription);
    })();

    // Race the workflow against the timeout
    return await Promise.race([workflowPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error executing workflow:", error);
    throw error;
  }
}
