import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: string;
  status: string;
  trialDays?: number;
  limits: { limitKey: string; limitValue: number }[];
  features: { featureKey: string; enabled: boolean }[];
  createdAt: string;
  updatedAt: string;
}

export async function listAdminPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await apiClient.get<ApiEnvelope<SubscriptionPlan[]>>('/admin/plans');
  return data.data ?? [];
}

export async function getAdminPlan(planId: string): Promise<SubscriptionPlan> {
  const { data } = await apiClient.get<ApiEnvelope<SubscriptionPlan>>(`/admin/plans/${planId}`);
  return data.data!;
}

export async function updateAdminPlan(
  planId: string,
  payload: { name?: string; description?: string; price?: number; status?: string },
): Promise<SubscriptionPlan> {
  const { data } = await apiClient.patch<ApiEnvelope<SubscriptionPlan>>(`/admin/plans/${planId}`, payload);
  return data.data!;
}

export async function updateAdminPlanLimits(
  planId: string,
  limits: { limitKey: string; limitValue: number }[],
): Promise<SubscriptionPlan> {
  const { data } = await apiClient.patch<ApiEnvelope<SubscriptionPlan>>(`/admin/plans/${planId}/limits`, { limits });
  return data.data!;
}
