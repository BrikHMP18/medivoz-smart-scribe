
// Define the types for our workflow
export interface ExtractionResult {
  motivo_consulta: string;
  sintomas_principales: string;
  antecedentes_relevantes: string;
  notas_adicionales: string;
}

export interface DiagnosisResult {
  diagnostico_principal: string;
}

export interface TreatmentResult {
  plan_tratamiento: string;
}

export interface MedicalRecord extends ExtractionResult, DiagnosisResult, TreatmentResult {}
