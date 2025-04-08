
// Shared constants
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const DEFAULT_MODEL = "gpt-4o-mini";
export const EXTRACTION_TIMEOUT = 25000; // 25 seconds timeout
export const DIAGNOSIS_TIMEOUT = 15000;  // 15 seconds timeout
export const TREATMENT_TIMEOUT = 15000;  // 15 seconds timeout
export const WORKFLOW_TIMEOUT = 45000;   // 45 seconds global timeout
