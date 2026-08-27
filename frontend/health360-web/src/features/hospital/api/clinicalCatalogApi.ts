import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface SymptomCatalogItem {
  symptomId: string;
  hospitalId: string;
  branchId?: string;
  code?: string;
  name: string;
  category?: string;
  active: boolean;
}

export interface DosageTemplate {
  dosageTemplateId: string;
  hospitalId: string;
  branchId?: string;
  label: string;
  doseText?: string;
  route?: string;
  frequency?: string;
  durationDays?: number;
  active: boolean;
}

export interface DiagnosisCatalogItem {
  diagnosisCatalogId: string;
  hospitalId: string;
  branchId?: string;
  icdCode: string;
  name: string;
  category?: string;
  active: boolean;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listSymptoms(hospitalId: string, branchId?: string) {
  const { data } = await apiClient.get<ApiEnvelope<SymptomCatalogItem[]>>('/hospital/catalogs/symptoms', {
    params: { hospitalId, branchId: branchId || undefined },
  });
  return unwrap(data) ?? [];
}

export async function createSymptom(payload: {
  hospitalId: string;
  branchId?: string;
  code?: string;
  name: string;
  category?: string;
}) {
  const { data } = await apiClient.post<ApiEnvelope<SymptomCatalogItem>>('/hospital/catalogs/symptoms', payload);
  return unwrap(data);
}

export async function listDosageTemplates(hospitalId: string, branchId?: string) {
  const { data } = await apiClient.get<ApiEnvelope<DosageTemplate[]>>('/hospital/catalogs/dosage-templates', {
    params: { hospitalId, branchId: branchId || undefined },
  });
  return unwrap(data) ?? [];
}

export async function createDosageTemplate(payload: {
  hospitalId: string;
  branchId?: string;
  label: string;
  doseText?: string;
  route?: string;
  frequency?: string;
  durationDays?: number;
}) {
  const { data } = await apiClient.post<ApiEnvelope<DosageTemplate>>(
    '/hospital/catalogs/dosage-templates',
    payload,
  );
  return unwrap(data);
}

export async function listDiagnoses(hospitalId: string, branchId?: string, q?: string) {
  const { data } = await apiClient.get<ApiEnvelope<DiagnosisCatalogItem[]>>('/hospital/catalogs/diagnoses', {
    params: { hospitalId, branchId: branchId || undefined, q: q || undefined },
  });
  return unwrap(data) ?? [];
}

export async function createDiagnosis(payload: {
  hospitalId: string;
  branchId?: string;
  icdCode: string;
  name: string;
  category?: string;
}) {
  const { data } = await apiClient.post<ApiEnvelope<DiagnosisCatalogItem>>(
    '/hospital/catalogs/diagnoses',
    payload,
  );
  return unwrap(data);
}
