import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface PredictiveInsight {
  insightId: string;
  hospitalId: string;
  branchId: string;
  insightType: string;
  severity: string;
  title: string;
  message: string;
  score: number;
  status: string;
  generatedAt: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function refreshPredictiveInsights(
  hospitalId: string,
  branchId: string,
): Promise<PredictiveInsight[]> {
  const { data } = await apiClient.post<ApiEnvelope<PredictiveInsight[]>>(
    '/api/v1/predictive/refresh',
    null,
    { params: { hospitalId, branchId } },
  );
  return unwrap(data);
}

export async function listPredictiveInsights(
  hospitalId: string,
  branchId: string,
): Promise<PredictiveInsight[]> {
  const { data } = await apiClient.get<ApiEnvelope<PredictiveInsight[]>>('/api/v1/predictive/insights', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function acknowledgePredictiveInsight(insightId: string): Promise<PredictiveInsight> {
  const { data } = await apiClient.post<ApiEnvelope<PredictiveInsight>>(
    `/api/v1/predictive/insights/${insightId}/acknowledge`,
  );
  return unwrap(data);
}
