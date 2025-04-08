
export interface MedicalRecordData {
  motivo_consulta: string;
  diagnostico_principal: string;
  plan_tratamiento: string;
  notas_adicionales: string;
  sintomas_principales: string;
  antecedentes_relevantes: string;
}

export interface AutoFillState {
  isAutoFilling: boolean;
  autoFillData: MedicalRecordData | null;
}
