import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope, AuthUser } from '@/features/auth/api/authApi';

export interface ImpersonationParty {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface ImpersonationContext {
  sessionId: string;
  environmentLabel: string;
  startedAt: string;
  expiresAt: string;
  reason?: string | null;
  actor: ImpersonationParty;
  subject: ImpersonationParty;
}

export interface ImpersonationCapability {
  enabled: boolean;
  environmentLabel?: string | null;
  maxDurationMinutes: number;
}

export interface ImpersonationStartResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: AuthUser;
  impersonation: ImpersonationContext;
}

export async function fetchImpersonationCapability(): Promise<ImpersonationCapability> {
  const { data } = await apiClient.get<ApiEnvelope<ImpersonationCapability>>('/admin/impersonation/capability');
  return data.data ?? { enabled: false, maxDurationMinutes: 60 };
}

export async function startImpersonation(targetUserId: string, reason?: string): Promise<ImpersonationStartResult> {
  const { data } = await apiClient.post<ApiEnvelope<ImpersonationStartResult>>('/admin/impersonation/start', {
    targetUserId,
    reason: reason?.trim() || undefined,
  });
  return data.data!;
}

export async function endImpersonation(): Promise<void> {
  await apiClient.post('/admin/impersonation/end');
}
