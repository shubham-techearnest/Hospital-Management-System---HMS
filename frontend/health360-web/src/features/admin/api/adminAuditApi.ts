import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  occurredAt: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function listAdminAuditLogs(params: {
  action?: string;
  entityType?: string;
  entityId?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<AuditLogEntry>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<AuditLogEntry>>>('/admin/audit-logs', { params });
  return data.data!;
}
