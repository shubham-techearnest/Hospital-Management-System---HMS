import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface PatientSummaryAllergy {
  name: string;
  severity?: string;
  reaction?: string;
}

export interface PatientSummaryMedication {
  name: string;
  dosage?: string;
  frequency?: string;
}

export interface PatientSummaryCondition {
  conditionName: string;
  status?: string;
}

export interface PatientSummaryVitals {
  id: string;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  spo2?: number;
  bloodGlucose?: number;
  glucoseReadingType?: string;
  recordedAt: string;
  bpClassification?: string;
  bpInterpretation?: string;
}

export interface PatientSummaryLabs {
  id: string;
  hba1c?: number;
  totalCholesterol?: number;
  hdl?: number;
  ldl?: number;
  triglycerides?: number;
  hemoglobin?: number;
  vitaminD?: number;
  tsh?: number;
  creatinine?: number;
  recordedAt: string;
}

export interface PatientSummaryGoal {
  goalType: string;
  label: string;
  targetDisplay?: string;
}

export interface PatientSummary {
  name: string;
  age?: number;
  gender?: string;
  allergies: PatientSummaryAllergy[];
  medications: PatientSummaryMedication[];
  chronicConditions: PatientSummaryCondition[];
  latestVitals?: PatientSummaryVitals | null;
  latestLabValues?: PatientSummaryLabs | null;
  healthGoals: PatientSummaryGoal[];
}

export async function getPatientSummary(patientId: string, appointmentId: string) {
  const { data } = await apiClient.get<ApiEnvelope<PatientSummary>>(`/patients/${patientId}/summary`, {
    params: { appointmentId },
  });
  return data.data;
}
